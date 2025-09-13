
import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import * as XLSX from 'xlsx';
import { CreateStudentDto } from '../dto/request/create-student.dto';
import { Student } from '../entities/student.entity';

/**
 * Контракти
 */
export type ImportRow = {
  fullName: string;
  roomNumber: string;
  faculty: string;
  course: string | number;
  studyGroup: string;
};

export type ImportReport = {
  totalRows: number;
  validRows: number;
  inserted: number;
  duplicatesSkipped: number;
  invalidRows: { rowIndex: number; errors: string[] }[];
};

export type Row = Record<string, unknown>;

/**
 * Константи
 */
const CHUNK_SIZE = 1000;
const DATA_ROW_OFFSET = 2; // 1 — заголовок, 2 — перший рядок з даними

/**
 * Нормалізація ключів заголовків (укр/рос/англ, пробіли, крапки, регістр)
 */
type Canon = 'fullName' | 'roomNumber' | 'faculty' | 'course' | 'studyGroup';

const normalizeKey = (s: string) =>
  s
    .normalize('NFKC')        // уніфікація Юнікоду (напр., № -> No)
    .replace(/\u00A0/g, ' ')  // NBSP -> пробіл
    .toLowerCase()
    .trim()
    .replace(/[^0-9\p{L}]+/gu, ''); // ЗАЛИШИТИ лише букви/цифри (Unicode)

function buildHeaderAliases(): Record<string, Canon> {
  const pairs: Array<[Canon, string[]]> = [
    ['fullName',   ['fullName','ПІБ','П.І.Б','ФИО','ПІБ студента','Прізвище та ім’я','Прізвище ім’я по батькові']],
    ['roomNumber', ['roomNumber','Номер кімнати','Кімната','Комната','Кімната №','№ кімнати','Комната №']],
    ['faculty',    ['faculty','Факультет']],
    ['course',     ['course','Курс','Рік навчання']],
    ['studyGroup', ['studyGroup','Навчальна група','Група','Группа']],
  ];

  const map: Record<string, Canon> = {};
  for (const [canon, syns] of pairs) {
    for (const s of syns) map[normalizeKey(s)] = canon;
  }
  return map;
}

const HEADER_ALIASES: Readonly<Record<string, Canon>> = Object.freeze(buildHeaderAliases());


@Injectable()
export class ImportStudentService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Оркестратор: XLSX → підготовка/валідація → дедуп → bulk insert → репорт
   */
  async importStudentsFromFile(file: Express.Multer.File): Promise<ImportReport> {
    this.assertFileNotEmpty(file);

    const rawRows = this.readRowsFromXlsx(file.buffer);
    const { prepared, invalidRows } = this.validateAndPrepare(rawRows);
    const uniqueRows = this.dedupePrepared(prepared);
    const { inserted, conflictSkipped } = await this.bulkInsertStudents(uniqueRows);

    return this.buildReport(rawRows.length, prepared.length, inserted, conflictSkipped, invalidRows);
  }

  // -------------------- I/O рівень --------------------

  private assertFileNotEmpty(file: Express.Multer.File): void {
    if (!file?.buffer?.length) throw new BadRequestException('File is empty!');
  }

  private readRowsFromXlsx(buffer: Buffer): Row[] {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Row>(ws, {
      defval: '',
      raw: true,
      blankrows: false,
    });
  }

  // -------------------- Підготовка даних --------------------

  private validateAndPrepare(rawRows: Row[]): {
    prepared: CreateStudentDto[];
    invalidRows: ImportReport['invalidRows'];
  } {
    const invalidRows: ImportReport['invalidRows'] = [];
    const prepared: CreateStudentDto[] = [];

    rawRows.forEach((raw, idx) => {
      const row = this.mapRow(raw);
      const dto = this.normalizeToDto(row);
      const errs = this.validateDto(dto);

      if (errs.length) {
        invalidRows.push({ rowIndex: idx + DATA_ROW_OFFSET, errors: errs });
      } else {
        prepared.push(dto);
      }
    });

    return { prepared, invalidRows };
  }

  /**
   * Ремап рядка за словником заголовків → Partial<ImportRow>
   */
  private remapRowByHeaders(raw: Row): Partial<ImportRow> {
    const out: Partial<ImportRow> = {};
    for (const [k, v] of Object.entries(raw)) {
      const alias = HEADER_ALIASES[normalizeKey(k)];
      if (!alias) continue;
      // перше непорожнє значення має пріоритет
      const prev = out[alias];
      const isPrevEmpty = prev === undefined || (typeof prev === 'string' && prev.trim() === '');
      if (isPrevEmpty) out[alias] = v as any;
    }
    return out;
  }

  /**
   * Мапінг назв колонок → внутрішній контракт ImportRow
   */
  private mapRow(raw: Row): ImportRow {
    const m = this.remapRowByHeaders(raw);

    const fullName = this.firstNonEmpty(m.fullName);
    const roomNumber = this.firstNonEmpty(m.roomNumber);
    const faculty = this.firstNonEmpty(m.faculty);
    const course = this.firstNonEmpty(m.course);
    const studyGroup = this.firstNonEmpty(m.studyGroup);

    return {
      fullName: this.toCleanString(fullName),
      roomNumber: this.toCleanString(roomNumber),
      faculty: this.toCleanString(faculty),
      course: this.toIntOrNaN(course),
      studyGroup: this.toCleanString(studyGroup),
    };
  }

  /**
   * Нормалізація → DTO інстанс (class-transformer)
   */
  private normalizeToDto(row: ImportRow): CreateStudentDto {
    const dtoLike: CreateStudentDto = {
      fullName: this.toCleanString(row.fullName),
      roomNumber: this.toCleanString(row.roomNumber),
      faculty: this.toCleanString(row.faculty),
      course: this.toIntOrNaN(row.course),
      studyGroup: this.toCleanString(row.studyGroup),
    } as CreateStudentDto;

    return plainToInstance(CreateStudentDto, dtoLike, { enableImplicitConversion: true });
  }

  /**
   * Валідація DTO (class-validator) з розгортанням вкладених помилок
   */
  private validateDto(dto: CreateStudentDto): string[] {
    const errors: ValidationError[] = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    return this.flattenValidationErrors(errors);
  }

  // -------------------- Дедуплікація та інсерти --------------------

  private dedupePrepared(prepared: CreateStudentDto[]): CreateStudentDto[] {
    const map = new Map<string, CreateStudentDto>();
    for (const row of prepared) map.set(this.keyFromDto(row), row);
    return Array.from(map.values());
  }

  private async bulkInsertStudents(
    rows: CreateStudentDto[],
  ): Promise<{ inserted: number; conflictSkipped: number }> {
    let inserted = 0;
    let conflictSkipped = 0;

    await this.dataSource.transaction(async (manager) => {
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const res = await manager
          .createQueryBuilder()
          .insert()
          .into(Student)
          .values(chunk)
          .orIgnore() // Postgres → ON CONFLICT DO NOTHING (потрібен унікальний індекс)
          .execute();

        inserted += res.identifiers.length;
        conflictSkipped += chunk.length - res.identifiers.length;
      }
    });

    return { inserted, conflictSkipped };
  }

  private buildReport(
    totalRows: number,
    validRows: number,
    inserted: number,
    duplicatesSkipped: number,
    invalidRows: ImportReport['invalidRows'],
  ): ImportReport {
    return { totalRows, validRows, inserted, duplicatesSkipped, invalidRows };
  }

  // -------------------- Утиліти --------------------

  private firstNonEmpty(...vals: unknown[]): unknown {
    for (const v of vals) {
      if (v === null || v === undefined) continue;
      if (typeof v === 'string' && v.trim() === '') continue;
      return v;
    }
    return '';
  }

  private toCleanString(v: unknown): string {
    return String(v ?? '').trim().replace(/\s+/g, ' ');
  }

  private toIntOrNaN(v: unknown): number {
    if (typeof v === 'number') return Number.isFinite(v) ? v : Number.NaN;
    const s = String(v ?? '').trim();
    if (!/^\d+$/.test(s)) return Number.NaN;
    return Number(s);
  }

  private keyFromDto(x: CreateStudentDto): string {
    return `${x.fullName}|${x.roomNumber}|${x.faculty}|${x.course}|${x.studyGroup}`;
  }

  private flattenValidationErrors(errs: ValidationError[], parentPath = ''): string[] {
    const out: string[] = [];
    for (const e of errs) {
      const path = parentPath ? `${parentPath}.${e.property}` : e.property;
      if (e.constraints) out.push(...Object.values(e.constraints).map((m) => `${path}: ${m}`));
      if (e.children?.length) out.push(...this.flattenValidationErrors(e.children, path));
    }
    return Array.from(new Set(out)); // dedupe
  }
}

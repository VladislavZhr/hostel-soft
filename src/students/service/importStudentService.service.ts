// src/students/service/importStudentService.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import * as ExcelJS from 'exceljs';
import { CreateStudentDto } from '../dto/request/create-student.dto';
import { Student } from '../entities/student.entity';
import type { Buffer as NodeBuffer } from 'node:buffer';
import { Readable } from 'typeorm/browser/platform/BrowserPlatformTools';
import { PassThrough } from 'node:stream';
import * as Stream from 'node:stream';

/**
 * Контракти
 */
export type ImportRow = {
  fullName: string;
  roomNumber: string;
  faculty: string;
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
 * Нормалізація ключів заголовків
 */
type Canon = 'fullName' | 'roomNumber' | 'faculty' | 'studyGroup';

const normalizeKey = (s: string) =>
  s
    .normalize('NFKC')
    .replace(/\u00A0/g, ' ')
    .toLowerCase()
    .trim()
    .replace(/[^0-9\p{L}]+/gu, '');

function buildHeaderAliases(): Record<string, Canon> {
  const pairs: Array<[Canon, string[]]> = [
    ['fullName',   ['fullName','ПІБ','П.І.Б','ФИО','ПІБ студента','Прізвище та ім’я','Прізвище ім’я по батькові']],
    ['roomNumber', ['roomNumber','Номер кімнати','Кімната','Комната','Кімната №','№ кімнати','Комната №']],
    ['faculty',    ['faculty','Факультет']],
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

    const rawRows = await this.readRowsFromXlsx(file.buffer);
    const { prepared, invalidRows } = this.validateAndPrepare(rawRows);
    const uniqueRows = this.dedupePrepared(prepared);
    const { inserted, conflictSkipped } = await this.bulkInsertStudents(uniqueRows);

    return this.buildReport(rawRows.length, prepared.length, inserted, conflictSkipped, invalidRows);
  }

  // -------------------- I/O рівень --------------------

  private assertFileNotEmpty(file: Express.Multer.File): void {
    if (!file?.buffer?.length) throw new BadRequestException('File is empty!');
  }

  private async readRowsFromXlsx(buffer: Buffer): Promise<Row[]> {
    const wb = new ExcelJS.Workbook();

    const stream = new PassThrough();
    stream.end(buffer);

    await wb.xlsx.read(stream); // ← exceljs очікує NodeJS stream, усе сумісно

    const ws = wb.worksheets[0];
    if (!ws) throw new BadRequestException('Excel file has no sheets');

    const headerRow = ws.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colIdx) => {
      headers[colIdx - 1] = String(cell.value ?? '').trim();
    });

    const rows: Row[] = [];
    ws.eachRow((row, rowIdx) => {
      if (rowIdx === 1) return;
      const json: Row = {};
      row.eachCell((cell, colIdx) => {
        const header = headers[colIdx - 1] ?? `col${colIdx}`;
        json[header] = cell.value ?? '';
      });
      rows.push(json);
    });

    return rows;
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

  private remapRowByHeaders(raw: Row): Partial<ImportRow> {
    const out: Partial<ImportRow> = {};
    for (const [k, v] of Object.entries(raw)) {
      const alias = HEADER_ALIASES[normalizeKey(k)];
      if (!alias) continue;
      const prev = out[alias];
      const isPrevEmpty = prev === undefined || (typeof prev === 'string' && prev.trim() === '');
      if (isPrevEmpty) out[alias] = v as any;
    }
    return out;
  }

  private mapRow(raw: Row): ImportRow {
    const m = this.remapRowByHeaders(raw);

    return {
      fullName: this.toCleanString(m.fullName),
      roomNumber: this.toCleanString(m.roomNumber),
      faculty: this.toCleanString(m.faculty),
      studyGroup: this.toCleanString(m.studyGroup),
    };
  }

  private normalizeToDto(row: ImportRow): CreateStudentDto {
    const dtoLike: CreateStudentDto = {
      fullName: this.toCleanString(row.fullName),
      roomNumber: this.toCleanString(row.roomNumber),
      faculty: this.toCleanString(row.faculty),
      studyGroup: this.toCleanString(row.studyGroup),
    } as CreateStudentDto;

    return plainToInstance(CreateStudentDto, dtoLike, { enableImplicitConversion: true });
  }

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
          .orIgnore()
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

  private toCleanString(v: unknown): string {
    return String(v ?? '').trim().replace(/\s+/g, ' ');
  }

  private keyFromDto(x: CreateStudentDto): string {
    return `${x.fullName}|${x.roomNumber}|${x.faculty}|${x.studyGroup}`;
  }

  private flattenValidationErrors(errs: ValidationError[], parentPath = ''): string[] {
    const out: string[] = [];
    for (const e of errs) {
      const path = parentPath ? `${parentPath}.${e.property}` : e.property;
      if (e.constraints) out.push(...Object.values(e.constraints).map((m) => `${path}: ${m}`));
      if (e.children?.length) out.push(...this.flattenValidationErrors(e.children, path));
    }
    return Array.from(new Set(out));
  }
}

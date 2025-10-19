// src/inventory/inventories.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpsertStockDto } from './dto/request/upsert-stock.dto';
import { IssueItemDto } from './dto/request/issue-item.dto';
import { ReturnItemDto } from './dto/request/return-item.dto';
import { InventoryKind } from './entities/InventoryKind';
import { InventoryStock } from './entities/inventory.entities';
import { StudentInventory } from './entities/student-inventory.entity';
import ExcelJS from 'exceljs';

import { HostelRepository } from './repository/StockRepository.repository';
import { StudentInventoryRepository } from './repository/StudentInventoryRepo.repository';
import { Student } from '../students/entities/student.entity';
import { labelInventoryKind } from './util/inventory-kind.map';

@Injectable()
export class InventoriesService {
  constructor(
    private readonly stockRepo: HostelRepository,
    private readonly studInvRepo: StudentInventoryRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // === Склад ===
  upsertStock(dto: UpsertStockDto): Promise<InventoryStock> {
    return this.stockRepo.upsertStock(dto);
  }

  async listStock(): Promise<Array<{ kind: InventoryKind; total: number; available: number }>> {
    const [stocks, activeGrouped] = await Promise.all([
      this.stockRepo.findAll(),
      this.studInvRepo.getActiveQtyGrouped(),
    ]);
    const activeMap = new Map(activeGrouped.map(r => [r.kind, r.qty]));
    return stocks.map(s => ({
      kind: s.kind,
      total: s.total,
      available: s.total - (activeMap.get(s.kind) ?? 0),
    }));
  }

  /** ВИДАЧА */
  async issue(dto: IssueItemDto): Promise<StudentInventory> {
    return this.dataSource.transaction(async (m) => {
      const sRepo = this.studInvRepo.withManager(m);

      const student = await m.getRepository(Student).findOneByOrFail({
        id: Number(dto.studentId),
      });

      // Збільшуємо кількість для студента або створюємо новий запис
      const updated = await sRepo.incrementForStudent(
        student,
        dto.kind,
        dto.quantity,
      );

      return updated;
    });
  }

  /**
   * Будує .xlsx з переліком студентів, у яких є активні позиції.
   * Кожний рядок — (студент, вид, кількість).
   */
  async exportAssignedXlsx(): Promise<Buffer> {
    const rows = await this.studInvRepo.listActiveAssignmentsFlat();
    // rows: { studentId, fullName, roomNumber, faculty, studyGroup, kind, quantity }[]

    // 1) Збираємо унікальні види інвентарю (для стовпців зведеної таблиці)
    const kinds: string[] = Array.from(
      new Set(rows.map(r => String(r.kind)))
    ).sort();

    // 2) Групуємо по студентові
    type PivotRow = {
      studentId: number | string;
      fullName: string;
      roomNumber: string | number | null;
      faculty: string | null;
      studyGroup: string | null;
      byKind: Record<string, number>;
    };

    const byStudent = new Map<string | number, PivotRow>();

    for (const r of rows) {
      const key = r.studentId;
      let bucket = byStudent.get(key);
      if (!bucket) {
        bucket = {
          studentId: r.studentId,
          fullName: r.fullName,
          roomNumber: r.roomNumber,
          faculty: r.faculty,
          studyGroup: r.studyGroup,
          byKind: {},
        };
        byStudent.set(key, bucket);
      }
      // Накопичуємо кількість лише для реально виданих позицій
      bucket.byKind[String(r.kind)] =
        (bucket.byKind[String(r.kind)] ?? 0) + Number(r.quantity ?? 0);
    }

    // 3) Будуємо Excel
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Assigned (Pivot)');

    // Шапка: базові поля + всі види інвентарю
    const header = [
      'ID студента',
      'ПІБ',
      'Кімната',
      'Факультет',
      'Група',
      ...kinds.map(k => labelInventoryKind(k)),
    ];
    ws.addRow(header);
    ws.getRow(1).font = { bold: true };

    // 4) Рядки
    for (const r of byStudent.values()) {
      // Якщо студент не має певного інвентарю — комірка буде порожньою
      const kindCells = kinds.map(k =>
        r.byKind[k] !== undefined ? r.byKind[k] : ''
      );
      ws.addRow([
        r.studentId,
        r.fullName,
        r.roomNumber ?? '',
        r.faculty ?? '',
        r.studyGroup ?? '',
        ...kindCells,
      ]);
    }

    // 5) Автопідгін ширини
    const colCount = ws.columnCount;
    for (let i = 1; i <= colCount; i++) {
      const col = ws.getColumn(i);
      let max = 12;
      col.eachCell({ includeEmpty: false }, cell => {
        const v = cell.value as unknown;
        let s = '';
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          s = String(v);
        } else if (v instanceof Date) {
          s = v.toISOString();
        } else if (v && typeof v === 'object' && 'text' in (v as any)) {
          s = String((v as any).text ?? '');
        }
        max = Math.max(max, s.length + 2);
      });
      col.width = Math.min(max, 40);
    }

    // 6) Генеруємо буфер
    const out = await wb.xlsx.writeBuffer();
    return out instanceof Buffer ? out : Buffer.from(new Uint8Array(out as ArrayBuffer));
  }

  /** ПОВЕРНЕННЯ */
  async return(dto: ReturnItemDto): Promise<StudentInventory | { closed: true }> {
    return this.dataSource.transaction(async (m) => {
      const sRepo = this.studInvRepo.withManager(m);

      const student = await m.getRepository(Student).findOneByOrFail({
        id: Number(dto.studentId),
      });

      // Дістаємо активну позицію (якщо нема — помилка)
      const active = await sRepo.findActiveByStudentAndKind(
        dto.studentId,
        dto.kind,
      );
      if (!active) throw new Error('Active assignment not found');

      // Обчислюємо, скільки реально повертається
      const requested = dto.quantity ?? null;
      const returnedQty =
        !requested || requested >= active.quantity
          ? active.quantity
          : requested;

      // Якщо повертається вся кількість — закриваємо запис
      const result = await sRepo.returnForStudent(
        dto.studentId,
        dto.kind,
        dto.quantity ?? null,
      );

      return result;
    });
  }

  // === Допоміжне — активні позиції студента ===
  listStudentItems(studentId: string): Promise<StudentInventory[]> {
    return this.studInvRepo.findActiveByStudent(studentId);
  }
}

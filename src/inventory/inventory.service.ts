// src/inventory/inventories.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpsertStockDto } from './dto/upsert-stock.dto';
import { IssueItemDto } from './dto/issue-item.dto';
import { ReturnItemDto } from './dto/return-item.dto';
import { InventoryKind } from './entities/InventoryKind';
import { InventoryStock } from './entities/inventory.entities';
import { StudentInventory } from './entities/student-inventory.entity';
import { EntityNotFoundException } from '../common/errors/exceptions';

import { HostelRepository } from './repository/StockRepository.repository';
import { StudentInventoryRepository } from './repository/StudentInventoryRepo.repository';
import { StudentRepository } from '../students/students.repository';

@Injectable()
export class InventoriesService {
  constructor(
    private readonly stockRepo: HostelRepository,
    private readonly studInvRepo: StudentInventoryRepository,
    private readonly studentRepo: StudentRepository,
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

  // === Видача ===
  async issue(dto: IssueItemDto): Promise<StudentInventory> {
    return this.dataSource.transaction(async (manager) => {
      const stockR   = this.stockRepo.withManager(manager);
      const studInvR = this.studInvRepo.withManager(manager);
      const studentR = this.studentRepo.withManager(manager);

      const student = await studentR.mustExist(dto.studentId);
      const stock   = await stockR.findByKind(dto.kind);
      if (!stock) throw new EntityNotFoundException(`Stock for kind "${dto.kind}" not found`);

      const activeQty = await studInvR.getActiveQtyByKind(dto.kind);
      const available = stock.total - activeQty;
      if (available < dto.quantity) {
        throw new BadRequestException(
          `Not enough "${dto.kind}" available. Needed ${dto.quantity}, available ${available}.`,
        );
      }

      // один активний запис на (student, kind)
      return studInvR.incrementForStudent(student, dto.kind, dto.quantity);
    });
  }

  // === Повернення ===
  async return(dto: ReturnItemDto): Promise<StudentInventory | { closed: true }> {
    return this.dataSource.transaction(async (manager) => {
      const studInvR = this.studInvRepo.withManager(manager);

      // метод сам кине помилку якщо активного запису немає
      return studInvR.returnForStudent(dto.studentId, dto.kind, dto.quantity);
    });
  }

  // === Допоміжне — активні позиції студента ===
  listStudentItems(studentId: string): Promise<StudentInventory[]> {
    return this.studInvRepo.findActiveByStudent(studentId);
  }
}

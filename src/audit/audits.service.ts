import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryAudit } from './entities/inventory-audit.entity';
import { InventoryKind } from '../inventory/entities/InventoryKind';
import { InventoryAuditItem } from './entities/inventory-audit-item.entity';
import { InventoryStock } from '../inventory/entities/inventory.entities';
import { StudentInventory } from '../inventory/entities/student-inventory.entity';
import { AuditsRepository } from './audits.repository';


@Injectable()
export class InventoryAuditsService {

  constructor(
    private readonly auditRepo: AuditsRepository,
    private readonly ds: DataSource,
  ) {}

  async createSnapshot(): Promise<InventoryAudit> {
    return this.ds.transaction(async (manager) => {
      // 1) total по складу
      const stocks = await manager.getRepository(InventoryStock).find(); // [{kind,total}]

      // 2) issued по активним видачам
      const issuedRaw = await manager.getRepository(StudentInventory)
        .createQueryBuilder('a')
        .select('a.kind', 'kind')
        .addSelect('COALESCE(SUM(a.quantity),0)', 'qty')
        .where('a.returnedAt IS NULL')
        .groupBy('a.kind')
        .getRawMany<{ kind: InventoryKind; qty: string }>();

      const issuedMap = new Map(issuedRaw.map(r => [r.kind, Number(r.qty)]));
      const items: InventoryAuditItem[] = stocks.map(s => {
        const issued = issuedMap.get(s.kind) ?? 0;
        const available = s.total - issued;
        return manager.getRepository(InventoryAuditItem).create({
          kind: s.kind,
          total: s.total,
          issued,
          available,
        });
      });

      // Якщо хочеш включити види, яких немає у stock (total=0), але видані — додай це:
      for (const [kind, qty] of issuedMap) {
        if (!stocks.find(s => s.kind === kind)) {
          items.push(manager.getRepository(InventoryAuditItem).create({
            kind: kind as InventoryKind,
            total: 0,
            issued: qty,
            available: 0 - qty,
          }));
        }
      }

      const audit = manager.getRepository(InventoryAudit).create({ items,});

      return manager.getRepository(InventoryAudit).save(audit);
    });
  }

  findAll() {
    return this.auditRepo.findAll();
  }

  findOne(id: string) {
    return this.auditRepo.findOne(id);
  }
}

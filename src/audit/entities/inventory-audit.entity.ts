// src/inventories/entities/inventory-audit.entity.ts
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToMany } from 'typeorm';
import { InventoryAuditItem } from './inventory-audit-item.entity';

@Entity('inventory_audit')
export class InventoryAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => InventoryAuditItem, (i) => i.audit, { cascade: ['insert'] })
  items!: InventoryAuditItem[];
}

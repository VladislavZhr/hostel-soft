// src/inventories/entities/inventory-audit-item.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { InventoryAudit } from './inventory-audit.entity';
import { InventoryKind } from '../../inventory/entities/InventoryKind';

@Entity('inventory_audit_item')
@Index(['audit', 'kind'], { unique: true })
export class InventoryAuditItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => InventoryAudit, (a) => a.items, { onDelete: 'CASCADE' })
  audit!: InventoryAudit;

  @Column({ type: 'enum', enum: InventoryKind })
  kind!: InventoryKind;

  @Column({ type: 'int' })
  total!: number;

  @Column({ type: 'int' })
  issued!: number;

  @Column({ type: 'int' })
  available!: number;
}


import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { InventoryKind } from './InventoryKind'

@Entity('inventory_stock')
@Unique(['kind'])
export class InventoryStock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: InventoryKind })
  kind!: InventoryKind;

  @Column({ type: 'int', default: 0 })
  total!: number;
}

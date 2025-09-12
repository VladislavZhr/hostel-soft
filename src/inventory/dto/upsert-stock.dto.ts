import { IsEnum, IsInt, Min } from 'class-validator';
import { InventoryKind } from '../entities/InventoryKind';

export class UpsertStockDto {
  @IsEnum(InventoryKind)
  kind!: InventoryKind;

  @IsInt()
  @Min(0)
  total!: number;
}

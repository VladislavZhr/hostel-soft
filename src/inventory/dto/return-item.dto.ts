import { IsEnum, IsInt, IsPositive, IsUUID, IsOptional } from 'class-validator';
import { InventoryKind } from '../entities/InventoryKind';

export class ReturnItemDto {
  @IsInt()
  @IsPositive()
  studentId!: number;

  @IsEnum(InventoryKind)
  kind!: InventoryKind;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;
}

import { IsEnum, IsInt, isInt, IsPort, IsPositive, IsUUID } from 'class-validator';
import { InventoryKind } from '../entities/InventoryKind';

export class IssueItemDto {
  @IsInt()
  @IsPositive()
  studentId!: number;

  @IsEnum(InventoryKind)
  kind!: InventoryKind;

  @IsInt()
  @IsPositive()
  quantity!: number;


}

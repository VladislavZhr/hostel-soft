import { IsEnum, IsInt, Min } from 'class-validator';
import { InventoryKind } from '../../entities/InventoryKind';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertStockDto {
  @ApiProperty({ enum: InventoryKind, enumName: 'InventoryKind', example: 'mattress' })
  @IsEnum(InventoryKind)
  kind!: InventoryKind;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsInt()
  @Min(0)
  total!: number;
}

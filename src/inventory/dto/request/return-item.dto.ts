import { IsEnum, IsInt, IsPositive, IsUUID, IsOptional } from 'class-validator';
import { InventoryKind } from '../../entities/InventoryKind';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReturnItemDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @IsPositive()
  studentId!: number;

  @ApiProperty({ enum: InventoryKind, enumName: 'InventoryKind', example: 'blanket' })
  @IsEnum(InventoryKind)
  kind!: InventoryKind;

  @ApiPropertyOptional({ example: 1, minimum: 1, description: 'Опціонально: якщо пропущено — повне повернення' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;
}

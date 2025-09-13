import { IsEnum, IsInt, isInt, IsPort, IsPositive, IsUUID } from 'class-validator';
import { InventoryKind } from '../../entities/InventoryKind';
import { ApiProperty } from '@nestjs/swagger';

export class IssueItemDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @IsPositive()
  studentId!: number;

  @ApiProperty({ enum: InventoryKind, enumName: 'InventoryKind', example: 'blanket' })
  @IsEnum(InventoryKind)
  kind!: InventoryKind;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @IsPositive()
  quantity!: number;


}

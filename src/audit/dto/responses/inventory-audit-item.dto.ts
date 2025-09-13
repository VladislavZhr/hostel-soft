// src/inventories/dto/responses/inventory-audit-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { InventoryKind } from '../../../inventory/entities/InventoryKind';

export class InventoryAuditItemDto {
  @ApiProperty({
    description: 'UUID позиції аудиту',
    example: '8bf4a0b9-2d24-4d1c-9a2e-1f7b4f6e4a10',
  })
  id!: string;

  @ApiProperty({
    description: 'Вид інвентарю',
    enum: InventoryKind,
    enumName: 'InventoryKind',
    example: 'blanket',
  })
  kind!: InventoryKind;

  @ApiProperty({ description: 'Загальна кількість на момент аудиту', example: 120, minimum: 0 })
  total!: number;

  @ApiProperty({ description: 'Кількість, видана студентам', example: 37, minimum: 0 })
  issued!: number;

  @ApiProperty({ description: 'Доступна кількість', example: 83, minimum: 0 })
  available!: number;
}

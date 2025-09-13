// src/inventory/dto/responses/inventory-stock.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { InventoryKind } from '../../entities/InventoryKind';

export class InventoryStockDto {
  @ApiProperty({
    enum: InventoryKind,
    enumName: 'InventoryKind',
    description: 'Вид інвентарю',
    example: 'blanket',
  })
  kind!: InventoryKind;

  @ApiProperty({
    description: 'Загальна кількість одиниць на складі',
    example: 50,
    minimum: 0,
  })
  total!: number;

  @ApiProperty({
    description: 'Доступна до видачі кількість (total - видано)',
    example: 38,
    minimum: 0,
  })
  available!: number;
}

// Альтернативна назва для списку (можеш використати той самий клас вище)
export class StockSummaryDto extends InventoryStockDto {}

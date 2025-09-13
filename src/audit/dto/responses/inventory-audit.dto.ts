// src/inventories/dto/responses/inventory-audit.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { InventoryAuditItemDto } from './inventory-audit-item.dto';

export class InventoryAuditDto {
  @ApiProperty({
    description: 'UUID аудиту',
    example: 'f115c75d-41ba-4657-bbff-7faff9404fce',
  })
  id!: string;

  @ApiProperty({
    description: 'Мітка часу створення аудиту',
    example: '2025-09-12T21:47:10.123Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Знімок складу на момент аудиту',
    type: InventoryAuditItemDto,
    isArray: true,
    example: [
      { id: '1a2b3c4d-0000-0000-0000-000000000001', kind: 'blanket', total: 120, issued: 37, available: 83 },
      { id: '1a2b3c4d-0000-0000-0000-000000000002', kind: 'mattress', total: 60, issued: 12, available: 48 }
    ],
  })
  items!: InventoryAuditItemDto[];
}

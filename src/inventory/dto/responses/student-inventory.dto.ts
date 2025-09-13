// src/inventory/dto/responses/student-inventory.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { InventoryKind } from '../../entities/InventoryKind';

export class StudentInventoryDto {
  @ApiProperty({ description: 'ID позиції (якщо є)', example: 123 })
  id!: number;

  @ApiProperty({
    description: 'ID студента-власника позиції',
    example: 1,
    minimum: 1,
  })
  studentId!: number;

  @ApiProperty({
    enum: InventoryKind,
    enumName: 'InventoryKind',
    description: 'Вид інвентарю',
    example: 'mattress',
  })
  kind!: InventoryKind;

  @ApiProperty({
    description: 'Поточна кількість, видана студенту (залишок по позиції)',
    example: 2,
    minimum: 0,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Ознака закриття позиції (повністю повернено)',
    example: false,
  })
  isClosed!: boolean;

  @ApiProperty({
    description: 'Час створення/першої видачі',
    example: '2025-09-12T10:15:30.000Z',
    format: 'date-time',
  })
  issuedAt!: string;

  @ApiProperty({
    description: 'Час останнього оновлення позиції',
    example: '2025-09-12T11:02:10.000Z',
    format: 'date-time',
  })
  updatedAt!: string;
}

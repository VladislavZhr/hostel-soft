// src/inventory/dto/responses/student-inventory.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryKind } from '../../entities/InventoryKind';

export class StudentBriefDto {
  @ApiProperty({ description: 'ID студента', example: 2 })
  id!: number;

  @ApiProperty({ description: 'ПІБ', example: 'Іваненко Іван Іванович' })
  fullName!: string;

  @ApiProperty({ description: 'Кімната', example: 'A-21' })
  roomNumber!: string;

  @ApiProperty({ description: 'Факультет', example: 'ФІОТ' })
  faculty!: string;

  @ApiProperty({ description: 'Курс', example: 1 })
  course!: number;

  @ApiProperty({ description: 'Навчальна група', example: 'КП-12' })
  studyGroup!: string;
}

export class StudentInventoryDto {
  @ApiProperty({
    description: 'UUID позиції',
    example: 'ff8fd4f2-a5a5-4c69-b20b-4a4a5617a7c7',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    enum: InventoryKind,
    enumName: 'InventoryKind',
    description: 'Вид інвентарю',
    example: 'towel',
  })
  kind!: InventoryKind;

  @ApiProperty({
    description: 'Поточна кількість, видана студенту (залишок по позиції)',
    example: 4,
    minimum: 0,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Час створення/першої видачі',
    example: '2025-09-12T21:42:37.186Z',
    format: 'date-time',
  })
  issuedAt!: string;

  @ApiPropertyOptional({
    description: 'Час повернення (null, якщо ще не повернено)',
    example: null,
    nullable: true,
    format: 'date-time',
  })
  returnedAt?: string | null;

  @ApiProperty({
    description: 'Дані студента-власника позиції',
    type: () => StudentBriefDto,
  })
  student!: StudentBriefDto;
}

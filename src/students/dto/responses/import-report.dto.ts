// src/students/dto/responses/import-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ImportReportDto {
  @ApiProperty({ example: 'Import finished' })
  message!: string;

  @ApiProperty({ example: 120, description: 'Всього рядків у файлі' })
  totalRows!: number;

  @ApiProperty({ example: 115, description: 'Коректних рядків (після валідації)' })
  validRows!: number;

  @ApiProperty({ example: 100, description: 'Скільки нових створено' })
  inserted!: number;

  @ApiProperty({ example: 10, description: 'Скільки дублікатів пропущено' })
  duplicatesSkipped!: number;

  @ApiProperty({
    description: 'Помилки по рядках',
    example: [{ rowIndex: 7, errors: ['Duplicate student record'] }],
  })
  invalidRows!: { rowIndex: number; errors: string[] }[];
}

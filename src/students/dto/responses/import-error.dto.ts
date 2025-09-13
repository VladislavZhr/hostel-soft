// src/students/dto/responses/import-error.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ImportErrorDto {
  @ApiProperty({ example: 7, description: 'Номер рядка у файлі' })
  row!: number;

  @ApiProperty({
    example: 'Duplicate student record',
    description: 'Причина/опис помилки',
  })
  reason!: string;
}

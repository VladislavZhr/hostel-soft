// src/students/dto/responses/student.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ example: 1, description: 'ID студента' })
  id!: number;

  @ApiProperty({ example: 'Іваненко Іван Іванович', description: 'ПІБ' })
  fullName!: string;

  @ApiProperty({ example: 'A-212', description: 'Кімната' })
  roomNumber!: string;

  // @ApiProperty({ example: 'ФІОТ', description: 'Факультет' })
  // faculty!: string;

  @ApiProperty({ example: 2, description: 'Курс' })
  course!: number;

  @ApiProperty({ example: 'КП-12', description: 'Навчальна група' })
  studyGroup!: string;
}

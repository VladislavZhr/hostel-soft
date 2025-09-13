// src/students/dto/responses/create-student.response.ts
import { ApiProperty } from '@nestjs/swagger';
import { StudentDto } from './student.dto';

export class CreateStudentResponseDto {
  @ApiProperty({ example: 'Student created' })
  message!: string;

  @ApiProperty({ type: StudentDto })
  data!: StudentDto;
}

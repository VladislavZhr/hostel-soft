// src/students/dto/responses/get-all-students.response.ts
import { ApiProperty } from '@nestjs/swagger';
import { StudentDto } from './student.dto';

export class GetAllStudentsResponseDto {
  @ApiProperty({ type: StudentDto, isArray: true })
  data!: StudentDto[];
}

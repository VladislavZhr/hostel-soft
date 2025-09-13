// src/students/dto/responses/update-student.response.ts
import { ApiProperty } from '@nestjs/swagger';
import { StudentDto } from './student.dto';

export class UpdateStudentResponseDto {
  @ApiProperty({ example: 'Student with id 1 updated successfully.' })
  message!: string;

  @ApiProperty({ type: StudentDto })
  data!: StudentDto;
}

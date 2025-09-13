// src/students/dto/responses/delete-student.response.ts
import { ApiProperty } from '@nestjs/swagger';

export class DeleteStudentResponseDto {
  @ApiProperty({
    example: 'Student with id 1 deleted successfully.',
  })
  message!: string;
}

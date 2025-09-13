// src/students/dto/create-student.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Іваненко Іван Іванович', minLength: 6, maxLength: 255 })
  @IsString() @IsNotEmpty() @MinLength(6) @MaxLength(255)
  fullName!: string;

  @ApiProperty({ example: 'A-212', minLength: 3, maxLength: 10 })
  @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(10)
  roomNumber!: string;

  @ApiProperty({ example: 'ФІОТ', minLength: 2, maxLength: 20 })
  @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(20)
  faculty!: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty() @IsNumber()
  course!: number;

  @ApiProperty({ example: 'КП-12', minLength: 2, maxLength: 20 })
  @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(20)
  studyGroup!: string;
}

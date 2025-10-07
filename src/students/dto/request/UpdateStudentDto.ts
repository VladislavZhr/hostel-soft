// src/students/dto/UpdateStudentDto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ example: 'Петренко Петро Петрович', minLength: 1, maxLength: 255 })
  @IsOptional() @IsString() @Length(1, 255)
  fullName?: string;

  @ApiPropertyOptional({ example: 'B-105', minLength: 1, maxLength: 10 })
  @IsOptional() @IsString() @Length(1, 10)
  roomNumber?: string;

  @ApiPropertyOptional({ example: 'ФПМ', minLength: 1, maxLength: 50 })
  @IsOptional() @IsString() @Length(1, 50)
  faculty?: string;

  // @ApiPropertyOptional({ example: 3 })
  // @IsOptional() @IsInt()
  // course?: number;

  @ApiPropertyOptional({ example: 'КП-21', minLength: 1, maxLength: 50 })
  @IsOptional() @IsString() @Length(1, 50)
  studyGroup?: string;
}

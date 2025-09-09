import { CreateStudentDto } from './create-student.dto';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateStudentDto extends PartialType(CreateStudentDto){
  @IsOptional() @IsString() @Length(1, 255)
  fullName?: string;

  @IsOptional() @IsString() @Length(1, 10)
  roomNumber?: string;

  @IsOptional() @IsString() @Length(1, 50)
  faculty?: string;

  @IsOptional() @IsInt()
  course?: number;

  @IsOptional() @IsString() @Length(1, 50)
  studyGroup?: string;
}

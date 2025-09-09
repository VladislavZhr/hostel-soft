import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  roomNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  faculty!: string;

  @IsNotEmpty()
  @IsNumber()
  course!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  studyGroup!: string;
}

import {IsString, MinLength, MaxLength} from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  username!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(128)
  password!: string;
}

// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Унікальний логін користувача (від 3 до 64 символів)',
    minLength: 3,
    maxLength: 64,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  username!: string;

  @ApiProperty({
    example: 'qwerty123',
    description: 'Пароль користувача (від 3 до 128 символів)',
    minLength: 3,
    maxLength: 128,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  password!: string;
}

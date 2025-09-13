// src/auth/dto/login-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT токен для авторизації',
  })
  access_token!: string;

  @ApiProperty({
    example: 1,
    description: 'ID користувача',
  })
  id!: number;

  @ApiProperty({
    example: 'admin',
    description: 'Username користувача',
  })
  username!: string;

  @ApiProperty({
    example: '2025-09-13T10:15:30.000Z',
    description: 'Час видачі токена (ISO 8601)',
  })
  issuedAt!: string;

  @ApiProperty({
    example: '2025-09-13T12:15:30.000Z',
    description: 'Час закінчення дії токена (ISO 8601)',
  })
  expiresAt!: string;
}

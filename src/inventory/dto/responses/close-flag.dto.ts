// src/inventory/dto/responses/close-flag.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CloseFlagDto {
  @ApiProperty({
    description: 'Ознака повного закриття позиції після повернення',
    example: true,
  })
  closed!: true;
}

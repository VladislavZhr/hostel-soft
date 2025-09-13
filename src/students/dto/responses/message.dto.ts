// src/students/dto/responses/message.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ example: 'Operation finished successfully' })
  message!: string;
}

// src/inventory/dto/responses/return-response.dto.ts
// Допоміжний тип для Swagger oneOf у відповіді ендпойнта /inventory/return
import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { StudentInventoryDto } from './student-inventory.dto';
import { CloseFlagDto } from './close-flag.dto';

@ApiExtraModels(StudentInventoryDto, CloseFlagDto)
export class ReturnResponseDto {
  // Цей клас не використовується напряму у рантаймі — лише як "посилання" для schema oneOf.
  // У контролері вкажеш:
  // @ApiOkResponse({
  //   description: 'Оновлена позиція студента або { closed: true }',
  //   schema: {
  //     oneOf: [
  //       { $ref: getSchemaPath(StudentInventoryDto) },
  //       { $ref: getSchemaPath(CloseFlagDto) },
  //     ],
  //   },
  // })
}

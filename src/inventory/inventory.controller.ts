// src/inventory/inventories.controller.ts
import {
  Body,
  Controller,
  Get, Header,
  Param,
  Post, Query, Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InventoriesService } from './inventory.service';
import { UpsertStockDto } from './dto/request/upsert-stock.dto';
import { IssueItemDto } from './dto/request/issue-item.dto';
import { ReturnItemDto } from './dto/request/return-item.dto';
import { InventoryKind } from './entities/InventoryKind';
import { InventoryStock } from './entities/inventory.entities';
import { StudentInventory } from './entities/student-inventory.entity';
import {
  ApiBody,
  ApiCreatedResponse, ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam, ApiProduces,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { InventoryStockDto, StockSummaryDto } from './dto/responses/inventory-stock.dto';
import { CloseFlagDto } from './dto/responses/close-flag.dto';
import { StudentInventoryDto } from './dto/responses/student-inventory.dto';
import { Response } from 'express';

export class ListLogsQuery {
  // опційні — дефолти нижче
  limit?: number;
  offset?: number;
}

@ApiTags('inventory')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('inventory')
export class InventoriesController {
  constructor(
    private readonly service: InventoriesService,
  ) {}

  // === Склад ===

  /** Створити/оновити залишок для виду інвентарю */

  @Post('stock')
  @ApiOperation({ summary: 'Створити/оновити залишок для виду інвентарю' })
  @ApiCreatedResponse({ description: 'Збережений запис складу', type: InventoryStockDto })
  @ApiBody({ type: UpsertStockDto })
  @ApiCreatedResponse({ description: 'Збережений запис складу' })
  upsertStock(@Body() dto: UpsertStockDto): Promise<InventoryStock> {
    return this.service.upsertStock(dto);
  }

  /** Отримати total/available по всіх видах інвентарю */
  @Get('stock')
  @ApiOperation({ summary: 'Отримати total/available по всіх видах' })
  @ApiOkResponse({ description: 'Список складу з доступністю', type: StockSummaryDto, isArray: true })
  @ApiOkResponse({ isArray: true })
  listStock(): Promise<Array<{ kind: InventoryKind; total: number; available: number }>> {
    return this.service.listStock();
  }

  // === Видача ===

  /** Видати студенту певну кількість інвентарю */
  @Post('issue')
  @ApiOperation({ summary: 'Видати студенту певну кількість інвентарю' })
  @ApiBody({ type: IssueItemDto })
  @ApiCreatedResponse({
    description: 'Створено/оновлено позицію студента',
    type: StudentInventoryDto,
  })

  issue(@Body() dto: IssueItemDto): Promise<StudentInventory> {
    return this.service.issue(dto);
  }

  // === Повернення ===

  /** Прийняти повне/часткове повернення інвентарю від студента */
  @Post('return')
  @ApiOperation({ summary: 'Прийняти повне/часткове повернення' })
  @ApiExtraModels(StudentInventoryDto, CloseFlagDto)
  @ApiOkResponse({
    description: 'Оновлена позиція студента або { closed: true }',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(StudentInventoryDto) },
        { $ref: getSchemaPath(CloseFlagDto) },
      ],
    },
  })
  @ApiBody({ type: ReturnItemDto })
  @ApiOkResponse({ description: 'Оновлена позиція студента або { closed: true }' })
  return(@Body() dto: ReturnItemDto): Promise<StudentInventory | { closed: true }> {
    return this.service.return(dto);
  }

  // === Активні позиції студента ===

  /** Список активних (не повернутих) позицій інвентарю конкретного студента */
  @Get('students/:studentId/items')
  @ApiOperation({ summary: 'Список активних позицій конкретного студента' })
  @ApiOkResponse({ description: 'Масив активних позицій студента', type: StudentInventoryDto, isArray: true })
  @ApiParam({ name: 'studentId', example: '1', type: Number })
  @ApiOkResponse({ description: 'Масив активних позицій студента' })
  listStudentItems(@Param('studentId') studentId: string): Promise<StudentInventory[]> {
    return this.service.listStudentItems(studentId);
  }


  @Get('export/assigned.xlsx')
  @ApiOperation({
    summary: 'Експорт Excel: студенти з активним інвентарем (поточні закріплення)',
    description:
      'Кожний рядок: ID студента, ПІБ, Кімната, Факультет, Група, Вид інвентарю, Кількість.',
  })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOkResponse({
    description: 'Файл .xlsx (binary)',
    schema: { type: 'string', format: 'binary' },
  })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAssigned(@Res() res: Response) {
    const buf = await this.service.exportAssignedXlsx();
    const fileName =
      `assigned-inventory-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.end(buf);
  }
}

// src/inventory/inventories.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InventoriesService } from './inventory.service';
import { UpsertStockDto } from './dto/upsert-stock.dto';
import { IssueItemDto } from './dto/issue-item.dto';
import { ReturnItemDto } from './dto/return-item.dto';
import { InventoryKind } from './entities/InventoryKind';
import { InventoryStock } from './entities/inventory.entities';
import { StudentInventory } from './entities/student-inventory.entity';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('inventory')
export class InventoriesController {
  constructor(private readonly service: InventoriesService) {}

  // === Склад ===

  /** Створити/оновити залишок для виду інвентарю */
  @Post('stock')
  upsertStock(@Body() dto: UpsertStockDto): Promise<InventoryStock> {
    return this.service.upsertStock(dto);
  }

  /** Отримати total/available по всіх видах інвентарю */
  @Get('stock')
  listStock(): Promise<Array<{ kind: InventoryKind; total: number; available: number }>> {
    return this.service.listStock();
  }

  // === Видача ===

  /** Видати студенту певну кількість інвентарю */
  @Post('issue')
  issue(@Body() dto: IssueItemDto): Promise<StudentInventory> {
    return this.service.issue(dto);
  }

  // === Повернення ===

  /** Прийняти повне/часткове повернення інвентарю від студента */
  @Post('return')
  return(@Body() dto: ReturnItemDto): Promise<StudentInventory | { closed: true }> {
    return this.service.return(dto);
  }

  // === Активні позиції студента ===

  /** Список активних (не повернутих) позицій інвентарю конкретного студента */
  @Get('students/:studentId/items')
  listStudentItems(@Param('studentId') studentId: string): Promise<StudentInventory[]> {
    return this.service.listStudentItems(studentId);
  }
}

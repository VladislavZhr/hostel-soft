import { Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { InventoryAuditsService } from './audits.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { InventoryAuditDto } from './dto/responses/inventory-audit.dto';

@ApiTags('inventory-audits')
@Controller('inventories/audits')
export class InventoryAuditsController {
  constructor(private readonly service: InventoryAuditsService) {}

  @Post()
  @ApiOperation({ summary: 'Створити знімок складу (аудит)' })
  @ApiCreatedResponse({
    description: 'Створений аудит із items[]',
    type: InventoryAuditDto,
  })
  async create(): Promise<InventoryAuditDto> {
    const audit = await this.service.createSnapshot();
    return audit as unknown as InventoryAuditDto;
  }

  @Get()
  @ApiOperation({ summary: 'Список аудитів' })
  @ApiOkResponse({
    description: 'Масив аудитів',
    type: InventoryAuditDto,
    isArray: true,
  })
  async list(): Promise<InventoryAuditDto[]> {
    const audits = await this.service.findAll();
    return audits as unknown as InventoryAuditDto[];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати аудит за ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID аудиту',
    schema: { type: 'string', format: 'uuid' },
    example: 'f115c75d-41ba-4657-bbff-7faff9404fce',
  })
  @ApiOkResponse({
    description: 'Деталі аудиту',
    type: InventoryAuditDto,
  })
  async get(@Param('id') id: string): Promise<InventoryAuditDto> {
    const audit = await this.service.findOne(id);
    return audit as unknown as InventoryAuditDto;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити аудит за ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID аудиту',
    schema: { type: 'string', format: 'uuid' },
    example: 'f115c75d-41ba-4657-bbff-7faff9404fce',
  })
  @ApiOkResponse({ description: 'Аудит успішно видалено' })
  @ApiNotFoundResponse({ description: 'Аудит не знайдено' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: 'Аудит успішно видалено' };
  }
}

// src/inventories/inventory-audits.controller.ts
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { InventoryAuditsService } from "./audits.service";


@Controller('inventories/audits')
export class InventoryAuditsController {
  constructor(private readonly service: InventoryAuditsService) {}

  @Post()
  create() {
    return this.service.createSnapshot();
  }

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}

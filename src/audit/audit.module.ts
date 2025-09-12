// src/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryAudit } from './entities/inventory-audit.entity';
import { InventoryAuditItem } from './entities/inventory-audit-item.entity';

import { AuditsRepository } from './audits.repository';
import { InventoryAuditsService } from './audits.service';
import { InventoryAuditsController } from './audits.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryAudit, InventoryAuditItem]),
  ],
  controllers: [InventoryAuditsController],
  providers: [InventoryAuditsService, AuditsRepository],
  exports: [
    InventoryAuditsService,         // якщо треба викликати з інших модулів
    AuditsRepository,      // якщо інші модулі напряму користуються репозиторієм
    TypeOrmModule,         // інколи зручно експортувати і його
  ],
})
export class AuditModule {}

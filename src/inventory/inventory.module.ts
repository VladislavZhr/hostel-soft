// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryStock } from './entities/inventory.entities';
import { StudentInventory } from './entities/student-inventory.entity';
import { Student } from '../students/entities/student.entity';

import { InventoriesController } from './inventory.controller'; // <- ім'я контролера з твого коду
import { InventoriesService } from './inventory.service';

import { HostelRepository } from './repository/StockRepository.repository';
import { StudentInventoryRepository } from './repository/StudentInventoryRepo.repository';
import { StudentRepository } from '../students/students.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryStock,
      StudentInventory,
      Student,
    ]),
  ],
  controllers: [InventoriesController],
  providers: [
    InventoriesService,
    HostelRepository,
    StudentInventoryRepository,
    StudentRepository,
  ],
  exports: [
    InventoriesService,
    HostelRepository,
    StudentInventoryRepository,
  ],
})
export class InventoryModule {}

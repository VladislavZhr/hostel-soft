import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryStock } from './entities/inventory.entities';
import { StudentInventory } from './entities/student-inventory.entity';
import { Student } from '../students/entities/student.entity';

import { InventoriesController } from './inventory.controller';
import { InventoriesService } from './inventory.service';

import { HostelRepository } from './repository/StockRepository.repository';
import { StudentInventoryRepository } from './repository/StudentInventoryRepo.repository';
import { StudentRepository } from '../students/students.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryStock, StudentInventory, Student]),
  ],
  controllers: [InventoriesController],
  providers: [
    InventoriesService,
    HostelRepository,
    StudentInventoryRepository,
    StudentRepository, // <-- локально оголошуємо
  ],
  exports: [
    InventoriesService,
    HostelRepository,
    StudentInventoryRepository,
    TypeOrmModule,
  ],
})
export class InventoryModule {}

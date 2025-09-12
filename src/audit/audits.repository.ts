// src/inventory/audits.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InventoryAudit } from './entities/inventory-audit.entity';

@Injectable()
export class AuditsRepository {
  constructor(
    @InjectRepository(InventoryAudit)
    private readonly repo: Repository<InventoryAudit>,
  ) {}

  /** Опційно: прив’язка до транзакційного менеджера */
  withManager(manager: EntityManager): AuditsRepository {
    return new AuditsRepository(manager.getRepository(InventoryAudit));
  }

  /** Усі аудити з items, від новіших до старіших */
  findAll(): Promise<InventoryAudit[]> {
    return this.repo.find({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  /** Один аудит з items за id */
  findOne(id: string): Promise<InventoryAudit | null> {
    return this.repo.findOne({
      where: { id },
      relations: { items: true },
    });
  }
}

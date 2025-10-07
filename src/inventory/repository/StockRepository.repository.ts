

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryStock } from '../entities/inventory.entities';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InventoryKind } from '../entities/InventoryKind';
import { UpsertStockDto } from '../dto/request/upsert-stock.dto';


@Injectable()
export class HostelRepository {

  constructor(
    @InjectRepository(InventoryStock)
    private readonly repo: Repository<InventoryStock>,
    private readonly dataSource: DataSource,
  ) {
  }

  withManager(manager: EntityManager): HostelRepository {
    return new HostelRepository(manager.getRepository(InventoryStock), this.dataSource);
  }

  findAll(): Promise<InventoryStock[]> {
    return this.repo.find();
  }

  findByKind(kind: InventoryKind): Promise<InventoryStock | null> {
    return this.repo.findOne({ where: { kind } });
  }

  create(dto: Partial<InventoryStock>): InventoryStock {
    return this.repo.create(dto);
  }

  save(entity: InventoryStock): Promise<InventoryStock> {
    return this.repo.save(entity);
  }

  async upsertStock(dto: UpsertStockDto): Promise<InventoryStock> {
    const existing = await this.findByKind(dto.kind);
    if (existing) {
      existing.total = dto.total;
      return this.save(existing);
    }
    return this.save(this.create(dto));
  }
}

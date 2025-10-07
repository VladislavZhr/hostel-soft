import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  async createAndSave(user: Partial<User>) {
    const entity = this.repo.create(user);
    return this.repo.save(entity);
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.repo.update({ id: userId }, { passwordHash });
  }
}

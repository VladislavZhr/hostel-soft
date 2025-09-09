import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { User } from './entities/user.entity';
import { DuplicateStudentException, EntityNotFoundException } from '../common/errors/exceptions';


@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UsersRepository) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findByUsername(dto.username);
    if (existing) throw new DuplicateStudentException();

    const passwordHash = await argon2.hash(dto.password);
    const saved = await this.userRepo.createAndSave({
      username: dto.username,
      passwordHash,
    });

    // не віддаємо хеш назовні
    const { passwordHash: _, ...safe } = saved;
    return safe;
  }

  async validatePassword(username: string, plain: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new EntityNotFoundException('USER');
    const ok = await argon2.verify(user.passwordHash, plain);
    return ok ? user : null;
  }

  async findByUsername(username: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new EntityNotFoundException('USER');
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

}

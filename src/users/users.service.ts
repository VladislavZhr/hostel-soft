import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as argon2 from 'argon2';
import { EntityNotFoundException } from '../common/errors/exceptions';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UsersRepository) {}

  async create(dto: any) {
    const existing = await this.userRepo.findByUsername(dto.username);
    if (existing) throw new Error('USER_ALREADY_EXISTS');
    const passwordHash = await argon2.hash(dto.password);
    const saved = await this.userRepo.createAndSave({
      username: dto.username,
      passwordHash,
    });
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

  async changePassword(username: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new EntityNotFoundException('USER');

    const ok = await argon2.verify(user.passwordHash, oldPassword);
    if (!ok) throw new Error('INVALID_OLD_PASSWORD');

    const newHash = await argon2.hash(newPassword);
    await this.userRepo.updatePassword(user.id, newHash);

    return { message: 'Password updated successfully' };
  }
}

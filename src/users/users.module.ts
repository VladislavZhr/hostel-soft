import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthController } from '../auth/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersRepository, UsersService, UsersController],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

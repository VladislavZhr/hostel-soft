import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    // повертаємо user або null (LocalStrategy очікує саме так)
    const userOrNull: User | null = await this.usersService.validatePassword(username, password);
    return userOrNull;
  }

  async signToken(user: { id: string; username: string }) : Promise<{access_token: string}>  {
    // JWT payload з username усередині
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwt.signAsync(payload, {
      secret: this.cfg.get<string>('JWT_SECRET'),
      expiresIn: this.cfg.get<string>('JWT_EXPIRES') ?? '1h',
    });
    return { access_token };
  }
}

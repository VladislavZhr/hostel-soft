// src/auth/auth.controller.ts
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Авторизація користувача за логіном та паролем' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Успішна авторизація, повертається JWT токен',
    type: LoginResponseDto,
  })
  async login(@Body() _dto: LoginDto, @Request() req: any) {
    const { id, username } = req.user;
    return this.authService.signToken({ id, username });
  }
}

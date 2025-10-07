import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

class ChangePasswordResponse {
  message!: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Створити нового користувача' })
  @ApiOkResponse({
    description: 'Створений користувач (без паролю)',
    type: CreateUserDto,
  })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Змінити пароль користувача' })
  @ApiOkResponse({
    description: 'Пароль успішно змінено',
    type: ChangePasswordResponse,
  })
  @ApiBadRequestResponse({ description: 'Старий пароль невірний або дані некоректні' })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  async changePassword(@Body() dto: ChangePasswordDto): Promise<ChangePasswordResponse> {
    return this.usersService.changePassword(dto.username, dto.oldPassword, dto.newPassword);
  }
}

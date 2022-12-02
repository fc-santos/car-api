import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos';
import { UsersService } from './users.service';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(dto: CreateUserDto) {
    const users = await this.usersService.find(dto.email);
    if (users.length) throw new BadRequestException('Email is already in use');
    const hash = await argon.hash(dto.password);
    dto.password = hash;
    return await this.usersService.create(dto);
  }

  async signin(creds: CreateUserDto) {
    const [user] = await this.usersService.find(creds.email);
    if (!user) throw new NotFoundException('User not found');
    const pwMatches = await argon.verify(user.password, creds.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    return user;
  }
}

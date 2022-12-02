import {
  Body,
  Controller,
  Get,
  // Patch,
  // Param,
  // Query,
  Post,
  // Delete,
  // NotFoundException,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Serialize } from '../interceptors';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators';
import { CreateUserDto, UserDto } from './dtos';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from '../guards';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  // @Get()
  // findAllUsers(@Query('email') email: string) {
  //   return this.usersService.find(email);
  // }

  // @Get('/:id')
  // async findUser(@Param('id') id: string) {
  //   const user = await this.usersService.findOne(parseInt(id));
  //   if (!user) throw new NotFoundException('user not found');
  //   return user;
  // }

  @Post('/logout')
  logout(@Session() session: any) {
    session.userId = null;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async sigin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.sigin(body);
    session.userId = user.id;
    return user;
  }

  // @Get('/whoami')
  // whoAmI(@Session() session: any) {
  //   return this.usersService.findOne(session.userId);
  // }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  // @Patch('/:id')
  // updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
  //   return this.usersService.update(parseInt(id), body);
  // }

  // @Delete('/:id')
  // removeUser(@Param('id') id: string) {
  //   return this.usersService.remove(parseInt(id));
  // }
}

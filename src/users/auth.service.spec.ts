import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (userDto: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email: userDto.email,
          password: userDto.password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(authService).toBeDefined();
  });

  it('creates a new user with hashed password', async () => {
    const newUserDto: CreateUserDto = {
      email: 'fsantos@gmail.com',
      password: '12345',
    };
    const user = await authService.signup(newUserDto);

    expect(user.password).not.toEqual('12345');
    expect(user.password).toContain('argon');
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await authService.signup({
      email: 'test@test.com',
      password: '12345',
    } as CreateUserDto);
    try {
      await authService.signup({
        email: 'test@test.com',
        password: '12345',
      } as CreateUserDto);
    } catch (err) {
      expect(err.message).toEqual('Email is already in use');
    }
  });

  it('throws if signin is called with an unused email', async () => {
    try {
      await authService.signin({
        email: 'test@test.com',
        password: '12345',
      } as CreateUserDto);
    } catch (err) {
      expect(err.message).toEqual('User not found');
    }
  });

  it('throws if an invalid password is provided', async () => {
    await authService.signup({
      email: 'test@test.com',
      password: '123',
    } as CreateUserDto);
    try {
      await authService.signin({
        email: 'test@test.com',
        password: '12345678',
      } as CreateUserDto);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('returns a user if correct password is provided', async () => {
    await authService.signup({
      email: 'test@test.com',
      password: '12345',
    } as CreateUserDto);
    const user = await authService.signin({
      email: 'test@test.com',
      password: '12345',
    } as CreateUserDto);
    expect(user).toBeDefined();
  });
});

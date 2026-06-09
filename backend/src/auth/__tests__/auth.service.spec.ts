import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

const USER_ID = '507f191e810c19729de860ea';

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: USER_ID,
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: '$2b$10$hashedpassword',
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('7d'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('creates a user and returns accessToken + user profile', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser() as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      const result = await service.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Secret123!',
      });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user).toEqual({
        id: USER_ID,
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    it('hashes the password before storing', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser() as never);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await service.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Secret123!',
      });

      expect(hashSpy).toHaveBeenCalledWith('Secret123!', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        'Jane Doe',
        'jane@example.com',
        'hashed',
      );
    });

    it('throws ConflictException when email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser() as never);

      await expect(
        service.register({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Secret123!',
        }),
      ).rejects.toThrow(ConflictException);

      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('signs a JWT with the new user id and email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(makeUser() as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await service.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Secret123!',
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: USER_ID, email: 'jane@example.com' },
        expect.any(Object),
      );
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns accessToken + user profile on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser() as never);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        email: 'jane@example.com',
        password: 'Secret123!',
      });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user.email).toBe('jane@example.com');
    });

    it('throws UnauthorizedException when email is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noone@example.com', password: 'Secret123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser() as never);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'jane@example.com', password: 'WrongPass1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns the same error message for bad email and bad password (no enumeration)', async () => {
      const errorMessage = 'Invalid email or password';

      usersService.findByEmail.mockResolvedValue(null);
      const err1 = await service
        .login({ email: 'ghost@example.com', password: 'x' })
        .catch((e: Error) => e);

      usersService.findByEmail.mockResolvedValue(makeUser() as never);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      const err2 = await service
        .login({ email: 'jane@example.com', password: 'wrong' })
        .catch((e: Error) => e);

      expect((err1 as UnauthorizedException).message).toBe(errorMessage);
      expect((err2 as UnauthorizedException).message).toBe(errorMessage);
    });

    it('signs a JWT with the user id and email', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser() as never);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await service.login({
        email: 'jane@example.com',
        password: 'Secret123!',
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: USER_ID, email: 'jane@example.com' },
        expect.any(Object),
      );
    });
  });
});

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create(dto.name, dto.email, hashedPassword);

    const accessToken = this.signToken(user.id as string, user.email);

    return {
      accessToken,
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.signToken(user.id as string, user.email);

    return {
      accessToken,
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
      },
    };
  }

  private signToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: this.config.get<string>('JWT_EXPIRES_IN') },
    );
  }
}

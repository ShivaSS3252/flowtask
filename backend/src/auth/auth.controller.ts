import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered and JWT returned' })
  @ApiConflictResponse({ description: 'Email already in use' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { data: result, message: 'Registration successful' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'JWT returned on successful login' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return { data: result, message: 'Login successful' };
  }
}

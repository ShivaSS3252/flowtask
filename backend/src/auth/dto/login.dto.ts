import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Secret123!', description: 'Password (min 6 chars)' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}

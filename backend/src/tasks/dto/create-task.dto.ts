import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority } from '../schemas/task.schema';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Write unit tests',
    description: 'Task title (1–200 characters)',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MinLength(1)
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'Cover all service methods with edge cases',
    description: 'Optional task description (max 2000 characters)',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
    description: 'Task priority level',
  })
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`,
  })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2024-06-10T00:00:00.000Z',
    description: 'Optional due date in ISO 8601 format',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dueDate must be a valid ISO 8601 date string' })
  dueDate?: string;
}

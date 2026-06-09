import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Updated task title',
    description: 'Task title (1–200 characters)',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
    description: 'Task description (max 2000 characters)',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    description: 'Task completion status',
  })
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
  })
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    description: 'Task priority level',
  })
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`,
  })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2024-06-15T00:00:00.000Z',
    description: 'Due date in ISO 8601 format. Send null to clear.',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o: UpdateTaskDto) => o.dueDate !== null)
  @IsDateString({}, { message: 'dueDate must be a valid ISO 8601 date string' })
  dueDate?: string | null;
}

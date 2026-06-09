import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { TasksService, TaskFilters } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, TaskPriority } from './schemas/task.schema';

interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ── POST /tasks ────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async create(@Req() req: AuthRequest, @Body() dto: CreateTaskDto) {
    const task = await this.tasksService.create(req.user.userId, dto);
    return { data: task, message: 'Task created successfully' };
  }

  // ── GET /tasks ─────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({
    name: 'sort',
    enum: ['createdAt', 'dueDate', 'priority'],
    required: false,
  })
  @ApiQuery({ name: 'order', enum: ['asc', 'desc'], required: false })
  @ApiResponse({ status: 200, description: 'Task list returned' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async findAll(
    @Req() req: AuthRequest,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('sort') sort?: TaskFilters['sort'],
    @Query('order') order?: TaskFilters['order'],
  ) {
    const { tasks, count } = await this.tasksService.findAll(
      req.user.userId,
      { status, priority, sort, order },
    );
    return { data: tasks, count };
  }

  // ── GET /tasks/:id ─────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({ name: 'id', description: 'Task MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Task returned' })
  @ApiNotFoundResponse({ description: 'Task not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    const task = await this.tasksService.findOne(req.user.userId, id);
    return { data: task };
  }

  // ── PUT /tasks/:id ─────────────────────────────────────────────────────────

  @Put(':id')
  @ApiOperation({ summary: 'Update a task (partial update)' })
  @ApiParam({ name: 'id', description: 'Task MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiNotFoundResponse({ description: 'Task not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.update(req.user.userId, id, dto);
    return { data: task, message: 'Task updated successfully' };
  }

  // ── DELETE /tasks/:id ──────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task permanently' })
  @ApiParam({ name: 'id', description: 'Task MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiNotFoundResponse({ description: 'Task not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async remove(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.tasksService.remove(req.user.userId, id);
    return { data: null, message: 'Task deleted successfully' };
  }
}

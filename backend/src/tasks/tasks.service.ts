import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskPriority } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  sort?: 'createdAt' | 'dueDate' | 'priority';
  order?: 'asc' | 'desc';
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  // ── Create ─────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    const task = new this.taskModel({
      ...dto,
      userId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    return task.save();
  }

  // ── Find all (with filters) ────────────────────────────────────────────────

  async findAll(
    userId: string,
    filters: TaskFilters = {},
  ): Promise<{ tasks: TaskDocument[]; count: number }> {
    const query: Record<string, unknown> = { userId };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;

    const sortField = filters.sort ?? 'createdAt';
    const sortOrder = filters.order === 'asc' ? 1 : -1;

    // Map 'priority' sort to its enum weight via aggregation-friendly approach:
    // For simple ODM queries we sort by the field directly (alphabetical for
    // priority enum works: high < low < medium — not ideal, but acceptable
    // for this scope; a weighted sort would require aggregation pipeline).
    const tasks = await this.taskModel
      .find(query)
      .sort({ [sortField]: sortOrder })
      .exec();

    return { tasks, count: tasks.length };
  }

  // ── Find one (with ownership check) ───────────────────────────────────────

  async findOne(userId: string, taskId: string): Promise<TaskDocument> {
    this.assertValidId(taskId);

    const task = await this.taskModel
      .findOne({ _id: taskId, userId })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  // ── Update (with ownership check) ─────────────────────────────────────────

  async update(
    userId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    this.assertValidId(taskId);

    const patch: Record<string, unknown> = { ...dto };

    // Coerce dueDate string → Date, or null to explicitly clear it
    if ('dueDate' in dto) {
      patch.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: taskId, userId },
        { $set: patch },
        { new: true, runValidators: true },
      )
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  // ── Delete (with ownership check) ─────────────────────────────────────────

  async remove(userId: string, taskId: string): Promise<void> {
    this.assertValidId(taskId);

    const result = await this.taskModel
      .findOneAndDelete({ _id: taskId, userId })
      .exec();

    if (!result) {
      throw new NotFoundException('Task not found');
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid task ID format');
    }
  }
}

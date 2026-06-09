import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TasksService } from '../tasks.service';
import { Task, TaskStatus, TaskPriority } from '../schemas/task.schema';

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';
const ANOTHER_OBJECT_ID = '507f1f77bcf86cd799439012';
const USER_ID = '507f191e810c19729de860ea';
const INVALID_ID = 'not-a-valid-id';

function makeTask(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_OBJECT_ID,
    _id: VALID_OBJECT_ID,
    title: 'Test task',
    description: 'A description',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    userId: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ── Mock model factory ────────────────────────────────────────────────────────

function createMockModel(savedDoc: unknown) {
  const mockInstance = {
    save: jest.fn().mockResolvedValue(savedDoc),
  };

  const MockModel = jest.fn(() => mockInstance) as unknown as {
    new (...args: unknown[]): typeof mockInstance;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    findOneAndDelete: jest.Mock;
  };

  MockModel.find = jest.fn();
  MockModel.findOne = jest.fn();
  MockModel.findOneAndUpdate = jest.fn();
  MockModel.findOneAndDelete = jest.fn();

  return { MockModel, mockInstance };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('TasksService', () => {
  let service: TasksService;
  let MockModel: ReturnType<typeof createMockModel>['MockModel'];

  beforeEach(async () => {
    const task = makeTask();
    const mocks = createMockModel(task);
    MockModel = mocks.MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('saves a new task and returns it', async () => {
      const dto = { title: 'Test task', description: 'A description' };
      const result = await service.create(USER_ID, dto);

      expect(result).toMatchObject({ title: 'Test task', userId: USER_ID });
    });

    it('converts dueDate string to Date object before saving', async () => {
      const dto = { title: 'Task with due date', dueDate: '2024-06-10T00:00:00.000Z' };
      await service.create(USER_ID, dto);

      const constructorCall = (MockModel as unknown as jest.Mock).mock.calls[0][0];
      expect(constructorCall.dueDate).toBeInstanceOf(Date);
    });

    it('sets dueDate to null when not provided', async () => {
      const dto = { title: 'No due date' };
      await service.create(USER_ID, dto);

      const constructorCall = (MockModel as unknown as jest.Mock).mock.calls[0][0];
      expect(constructorCall.dueDate).toBeNull();
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all tasks for a user with count', async () => {
      const tasks = [makeTask(), makeTask({ id: ANOTHER_OBJECT_ID })];
      MockModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(tasks) }) });

      const result = await service.findAll(USER_ID);

      expect(result.tasks).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(MockModel.find).toHaveBeenCalledWith({ userId: USER_ID });
    });

    it('filters by status when provided', async () => {
      MockModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) });

      await service.findAll(USER_ID, { status: TaskStatus.COMPLETED });

      expect(MockModel.find).toHaveBeenCalledWith({
        userId: USER_ID,
        status: TaskStatus.COMPLETED,
      });
    });

    it('filters by priority when provided', async () => {
      MockModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) });

      await service.findAll(USER_ID, { priority: TaskPriority.HIGH });

      expect(MockModel.find).toHaveBeenCalledWith({
        userId: USER_ID,
        priority: TaskPriority.HIGH,
      });
    });

    it('defaults to sorting by createdAt descending', async () => {
      const mockSort = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      MockModel.find.mockReturnValue({ sort: mockSort });

      await service.findAll(USER_ID);

      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('sorts ascending when order=asc is passed', async () => {
      const mockSort = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      MockModel.find.mockReturnValue({ sort: mockSort });

      await service.findAll(USER_ID, { sort: 'createdAt', order: 'asc' });

      expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the task when it belongs to the user', async () => {
      const task = makeTask();
      MockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(task) });

      const result = await service.findOne(USER_ID, VALID_OBJECT_ID);

      expect(result).toEqual(task);
      expect(MockModel.findOne).toHaveBeenCalledWith({
        _id: VALID_OBJECT_ID,
        userId: USER_ID,
      });
    });

    it('throws NotFoundException when task is not found', async () => {
      MockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findOne(USER_ID, VALID_OBJECT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for a task owned by a different user', async () => {
      // Ownership is enforced in the query itself — null result = 404
      MockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.findOne('different-user-id', VALID_OBJECT_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for a malformed ID', async () => {
      await expect(service.findOne(USER_ID, INVALID_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('returns the updated task on success', async () => {
      const updated = makeTask({ status: TaskStatus.COMPLETED });
      MockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      const result = await service.update(USER_ID, VALID_OBJECT_ID, {
        status: TaskStatus.COMPLETED,
      });

      expect(result.status).toBe(TaskStatus.COMPLETED);
    });

    it('passes $set patch to findOneAndUpdate', async () => {
      const updated = makeTask({ title: 'New title' });
      MockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      await service.update(USER_ID, VALID_OBJECT_ID, { title: 'New title' });

      expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: VALID_OBJECT_ID, userId: USER_ID },
        { $set: expect.objectContaining({ title: 'New title' }) },
        { new: true, runValidators: true },
      );
    });

    it('converts dueDate string to Date in the patch', async () => {
      const updated = makeTask({ dueDate: new Date('2024-06-15') });
      MockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      await service.update(USER_ID, VALID_OBJECT_ID, {
        dueDate: '2024-06-15T00:00:00.000Z',
      });

      const patchArg = MockModel.findOneAndUpdate.mock.calls[0][1].$set;
      expect(patchArg.dueDate).toBeInstanceOf(Date);
    });

    it('sets dueDate to null when null is passed (clearing it)', async () => {
      const updated = makeTask({ dueDate: null });
      MockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      await service.update(USER_ID, VALID_OBJECT_ID, { dueDate: null });

      const patchArg = MockModel.findOneAndUpdate.mock.calls[0][1].$set;
      expect(patchArg.dueDate).toBeNull();
    });

    it('throws NotFoundException when task does not belong to user', async () => {
      MockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.update(USER_ID, VALID_OBJECT_ID, { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for a malformed ID', async () => {
      await expect(
        service.update(USER_ID, INVALID_ID, { title: 'X' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes the task and returns void', async () => {
      MockModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(makeTask()),
      });

      await expect(
        service.remove(USER_ID, VALID_OBJECT_ID),
      ).resolves.toBeUndefined();

      expect(MockModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: VALID_OBJECT_ID,
        userId: USER_ID,
      });
    });

    it('throws NotFoundException when task is not found or not owned', async () => {
      MockModel.findOneAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.remove(USER_ID, VALID_OBJECT_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for a malformed ID', async () => {
      await expect(service.remove(USER_ID, INVALID_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

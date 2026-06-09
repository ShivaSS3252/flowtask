import { api } from './axiosClient';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
} from '../types/task.types';

interface ApiEnvelope<T> {
  data: T;
  message?: string;
  count?: number;
}

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (filters.status)   params.status   = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.sort)     params.sort     = filters.sort;
  if (filters.order)    params.order    = filters.order;

  const res = await api.get<ApiEnvelope<Task[]>>('/tasks', { params });
  return res.data.data;
}

export async function getTask(id: string): Promise<Task> {
  const res = await api.get<ApiEnvelope<Task>>(`/tasks/${id}`);
  return res.data.data;
}

export async function createTask(dto: CreateTaskDto): Promise<Task> {
  const res = await api.post<ApiEnvelope<Task>>('/tasks', dto);
  return res.data.data;
}

export async function updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
  const res = await api.put<ApiEnvelope<Task>>(`/tasks/${id}`, dto);
  return res.data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

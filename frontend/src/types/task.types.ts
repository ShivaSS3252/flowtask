export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type SortField = 'createdAt' | 'dueDate' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  sort?: SortField;
  order?: SortOrder;
}

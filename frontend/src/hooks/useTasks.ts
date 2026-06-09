import { useQuery } from '@tanstack/react-query';
import { getTasks } from '../api/tasks.api';
import type { TaskFilters } from '../types/task.types';

export const TASKS_QUERY_KEY = 'tasks' as const;

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: () => getTasks(filters),
    staleTime: 30_000,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createTask, updateTask, deleteTask } from '../api/tasks.api';
import { getErrorMessage } from '../api/axiosClient';
import { TASKS_QUERY_KEY } from './useTasks';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task.types';

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTaskDto) => createTask(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('Task created');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
      updateTask(id, dto),

    // Optimistic update: flip the task in the cache immediately
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY] });

      const previousTasks = queryClient.getQueriesData<Task[]>({
        queryKey: [TASKS_QUERY_KEY],
      });

      queryClient.setQueriesData<Task[]>(
        { queryKey: [TASKS_QUERY_KEY] },
        (old) =>
          old?.map((t) => (t.id === id ? { ...t, ...dto } : t)) ?? old,
      );

      return { previousTasks };
    },

    onError: (err, _vars, context) => {
      // Roll back all cached task lists to the snapshot
      context?.previousTasks.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(getErrorMessage(err));
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('Task updated');
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      toast.success('Task deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

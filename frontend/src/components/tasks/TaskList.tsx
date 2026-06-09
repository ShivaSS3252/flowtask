import { EmptyState } from '../ui/EmptyState';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types/task.types';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export function TaskList({ tasks, isLoading, isError, searchQuery, onAddTask, onEditTask }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-white/5 bg-white/3 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-400">Failed to load tasks. Please refresh the page.</p>
      </div>
    );
  }

  const filtered = searchQuery.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tasks;

  if (filtered.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? 'No matching tasks' : 'Your slate is clean âœ¨'}
        description={
          searchQuery
            ? `No tasks match "${searchQuery}"`
            : 'Great things start with a single task. Add yours now.'
        }
        action={!searchQuery ? { label: '+ Add your first task', onClick: onAddTask } : undefined}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {filtered.map((task, i) => (
        <div key={task.id} style={{ animationDelay: `${i * 50}ms` }}>
          <TaskCard task={task} onEdit={onEditTask} />
        </div>
      ))}
      <p className="pt-2 text-center text-xs text-gray-600">
        {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>
    </div>
  );
}

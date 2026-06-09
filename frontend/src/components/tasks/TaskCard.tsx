import { useState } from 'react';
import { useUpdateTask, useDeleteTask } from '../../hooks/useTaskMutations';
import { ConfirmDialog } from '../ui/ConfirmDialog';

import type { Task, TaskPriority } from '../../types/task.types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string; bar: string }> = {
  high:   { label: 'High',   className: 'badge-high',   bar: '#ef4444' },
  medium: { label: 'Medium', className: 'badge-medium', bar: '#f59e0b' },
  low:    { label: 'Low',    className: 'badge-low',    bar: '#10b981' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const completed = task.status === 'completed';
  const overdue   = !completed && task.dueDate && isOverdue(task.dueDate);
  const priority  = priorityConfig[task.priority];

  const handleToggle = () => {
    updateTask.mutate({ id: task.id, dto: { status: completed ? 'pending' : 'completed' } });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, { onSuccess: () => setConfirmOpen(false) });
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative p-4 transition-all duration-200 animate-[cardIn_0.3s_ease-out]"
        style={{
          borderRadius: '1rem',
          border: `1px solid ${hovered && !completed ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)'}`,
          background: completed ? 'rgba(255,255,255,0.02)' : hovered ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.04)',
          boxShadow: hovered && !completed ? '0 0 24px rgba(217,119,6,0.15)' : '0 2px 12px rgba(0,0,0,0.3)',
          opacity: completed ? 0.55 : 1,
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Left priority bar */}
        {!completed && (
          <div style={{ background: priority.bar, boxShadow: `0 0 8px ${priority.bar}60` }}
            className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full" />
        )}

        <div className="flex items-start gap-3 pl-2">
          {/* Checkbox */}
          <button onClick={handleToggle} disabled={updateTask.isPending}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200"
            style={completed
              ? { borderColor: '#d97706', background: 'linear-gradient(135deg,#d97706,#b45309)', boxShadow: '0 0 12px rgba(217,119,6,0.5)' }
              : { borderColor: 'rgba(255,255,255,0.2)', background: 'transparent' }
            }
            aria-label={completed ? 'Mark as pending' : 'Mark as completed'}>
            {completed && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold"
                style={{ color: completed ? '#57534e' : '#fef3c7', textDecoration: completed ? 'line-through' : 'none' }}>
                {task.title}
              </span>
              <span className={priority.className}>{priority.label}</span>
            </div>

            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs" style={{ color: '#78716c' }}>{task.description}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              {task.dueDate && (
                <span className="flex items-center gap-1" style={{ color: overdue ? '#fca5a5' : '#78716c', fontWeight: overdue ? 600 : 400 }}>
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  {overdue ? 'Overdue - ' : ''}{formatDate(task.dueDate)}
                </span>
              )}
              <span className="font-medium" style={{ color: completed ? '#d97706' : '#a8a29e' }}>
                {completed ? 'Done' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Actions — always visible, more prominent on hover */}
          <div className="flex shrink-0 items-center gap-1 transition-opacity duration-200" style={{ opacity: hovered ? 1 : 0.35 }}>
            <button onClick={() => onEdit(task)} aria-label="Edit task"
              className="btn-ghost" style={{ padding: '0.375rem' }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button onClick={() => setConfirmOpen(true)} aria-label="Delete task"
              className="btn-ghost" style={{ padding: '0.375rem', color: '#f87171' }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete}
        title="Delete task" message={`Delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete" loading={deleteTask.isPending} />
    </>
  );
}

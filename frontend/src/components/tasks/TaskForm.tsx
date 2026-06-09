import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskPriority, TaskStatus } from '../../types/task.types';

type FormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
};

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDto | UpdateTaskDto) => Promise<void>;
  task?: Task;
  isSubmitting: boolean;
}

export function TaskForm({ open, onClose, onSubmit, task, isSubmitting }: TaskFormProps) {
  const isEditing = !!task;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' });
    }
  }, [task, reset, open]);

  const handleFormSubmit = async (values: FormValues) => {
    const payload: CreateTaskDto | UpdateTaskDto = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      priority: values.priority,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      ...(isEditing ? { status: values.status } : {}),
    };
    await onSubmit(payload);
  };

  const labelStyle = { color: '#d6d3d1', fontSize: '0.875rem', fontWeight: 500 };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        <Input label="Title" placeholder="What needs to be done?" required
          error={errors.title?.message}
          {...register('title', { required: 'Title is required', maxLength: { value: 200, message: 'Max 200 characters' } })}
        />

        <div className="space-y-1.5">
          <label className="block" style={labelStyle}>Description</label>
          <textarea rows={3} placeholder="Add details (optional)"
            className="input-base resize-none"
            {...register('description', { maxLength: { value: 2000, message: 'Max 2000 characters' } })}
          />
          {errors.description && <p className="text-xs" style={{ color: '#fca5a5' }}>{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block" style={labelStyle}>Priority</label>
            <div className="relative">
              <select className="input-base" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="h-4 w-4" style={{ color: '#a8a29e' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <label className="block" style={labelStyle}>Status</label>
              <div className="relative">
                <select className="input-base" {...register('status')}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4" style={{ color: '#a8a29e' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className={`space-y-1.5 ${!isEditing ? 'col-span-2' : ''}`}>
            <label className="block" style={labelStyle}>Due date</label>
            <input type="date" className="input-base cursor-pointer"
              min={new Date().toISOString().split('T')[0]}
              {...register('dueDate')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{isEditing ? 'Save changes' : 'Create task'}</Button>
        </div>
      </form>
    </Modal>
  );
}

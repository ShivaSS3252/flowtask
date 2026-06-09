import { useState, useCallback } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskSearch } from '../components/tasks/TaskSearch';
import { Button } from '../components/ui/Button';
import { useTasks } from '../hooks/useTasks';
import { useCreateTask, useUpdateTask } from '../hooks/useTaskMutations';
import type { Task, TaskStatus, TaskFilters as ITaskFilters, SortField, SortOrder, CreateTaskDto, UpdateTaskDto } from '../types/task.types';

type FilterTab = 'all' | TaskStatus;

export function DashboardPage() {
  const [filterTab, setFilterTab]     = useState<FilterTab>('all');
  const [sortField, setSortField]     = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder]     = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen]       = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const queryFilters: ITaskFilters = {
    ...(filterTab !== 'all' ? { status: filterTab } : {}),
    sort: sortField,
    order: sortOrder,
  };

  const { data: tasks = [], isLoading, isError } = useTasks(queryFilters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const openCreate = () => { setEditingTask(undefined); setFormOpen(true); };
  const openEdit   = useCallback((task: Task) => { setEditingTask(task); setFormOpen(true); }, []);
  const closeForm  = () => { setFormOpen(false); setEditingTask(undefined); };

  const handleSortChange = (field: SortField, order: SortOrder) => { setSortField(field); setSortOrder(order); };

  const handleFormSubmit = async (data: CreateTaskDto | UpdateTaskDto) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, dto: data as UpdateTaskDto });
    } else {
      await createTask.mutateAsync(data as CreateTaskDto);
    }
    closeForm();
  };

  const isSubmitting   = createTask.isPending || updateTask.isPending;
  const totalCount     = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount   = tasks.filter(t => t.status === 'pending').length;
  const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-8 animate-[slideUp_0.28s_ease-out]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold" style={{ color: '#fef3c7' }}>My Tasks</h1>
                {totalCount > 0 && (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: 'rgba(217,119,6,0.2)', color: '#fbbf24', boxShadow: '0 0 0 1px rgba(251,191,36,0.25)' }}>
                    {totalCount}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm" style={{ color: '#78716c' }}>
                {totalCount === 0
                  ? 'Nothing here yet — add your first task'
                  : pendingCount === 0
                  ? 'All tasks done. You crushed it!'
                  : `${pendingCount} left to conquer`}
              </p>
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add task
            </Button>
          </div>

          {/* Stats */}
          {totalCount > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Total',     value: totalCount,     color: '#e7e5e4' },
                { label: 'Pending',   value: pendingCount,   color: '#fbbf24' },
                { label: 'Completed', value: completedCount, color: '#d97706' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl px-4 py-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(251,191,36,0.1)' }}>
                  <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="mt-0.5 text-xs" style={{ color: '#57534e' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span style={{ color: '#78716c' }}>Progress</span>
                <span className="font-bold" style={{ color: '#fbbf24' }}>{progressPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(to right, #d97706, #f59e0b)',
                    boxShadow: '0 0 12px rgba(217,119,6,0.6)',
                  }} />
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-3">
          <TaskSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Filters */}
        <div className="mb-4">
          <TaskFilters
            activeStatus={filterTab} onStatusChange={setFilterTab}
            sortField={sortField} sortOrder={sortOrder} onSortChange={handleSortChange}
          />
        </div>

        {/* Task list */}
        <TaskList tasks={tasks} isLoading={isLoading} isError={isError}
          searchQuery={searchQuery} onAddTask={openCreate} onEditTask={openEdit} />
      </main>

      <TaskForm open={formOpen} onClose={closeForm} onSubmit={handleFormSubmit}
        task={editingTask} isSubmitting={isSubmitting} />
    </div>
  );
}

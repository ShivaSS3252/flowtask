import type { TaskStatus, SortField, SortOrder } from '../../types/task.types';

type FilterTab = 'all' | TaskStatus;

interface TaskFiltersProps {
  activeStatus: FilterTab;
  onStatusChange: (status: FilterTab) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all',       label: 'All tasks' },
  { value: 'pending',   label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS: { label: string; field: SortField; order: SortOrder }[] = [
  { label: 'Newest first', field: 'createdAt', order: 'desc' },
  { label: 'Oldest first', field: 'createdAt', order: 'asc'  },
  { label: 'Due date',     field: 'dueDate',   order: 'asc'  },
  { label: 'Priority',     field: 'priority',  order: 'asc'  },
];

export function TaskFilters({ activeStatus, onStatusChange, sortField, sortOrder, onSortChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}>
        {TABS.map(tab => (
          <button key={tab.value} onClick={() => onStatusChange(tab.value)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
            style={activeStatus === tab.value
              ? { background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff8eb', boxShadow: '0 0 14px rgba(217,119,6,0.4)' }
              : { color: '#78716c' }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#57534e' }}>Sort by</span>
        <div className="relative">
          <select value={`${sortField}:${sortOrder}`}
            onChange={e => {
              const [field, order] = e.target.value.split(':') as [SortField, SortOrder];
              onSortChange(field, order);
            }}
            className="input-base py-1.5 text-xs pr-8"
            style={{ minWidth: '130px' }}>
            {SORT_OPTIONS.map(opt => (
              <option key={`${opt.field}:${opt.order}`} value={`${opt.field}:${opt.order}`}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-3.5 w-3.5" style={{ color: '#a8a29e' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

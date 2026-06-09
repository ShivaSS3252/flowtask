import { useEffect, useState } from 'react';

interface TaskSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskSearch({ value, onChange }: TaskSearchProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(timer);
  }, [local, onChange]);

  useEffect(() => {
    if (value === '') setLocal('');
  }, [value]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
        <svg className="h-4 w-4" style={{ color: '#78716c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      <input
        type="search"
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder="Search tasks..."
        className="input-base pl-10 pr-10"
        aria-label="Search tasks"
      />
      {local && (
        <button type="button" onClick={() => { setLocal(''); onChange(''); }}
          className="absolute inset-y-0 right-3 flex items-center transition-colors"
          style={{ color: '#78716c' }} aria-label="Clear search">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

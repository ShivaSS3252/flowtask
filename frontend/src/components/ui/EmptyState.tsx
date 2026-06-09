interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-[fadeIn_0.2s_ease-out]"
      style={{ borderRadius: '1rem', border: '1px dashed rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.02)' }}>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl animate-[float_6s_ease-in-out_infinite]"
        style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(251,191,36,0.2)', boxShadow: '0 0 24px rgba(217,119,6,0.15)' }}>
        <svg className="h-8 w-8" style={{ color: '#d97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold" style={{ color: '#e7e5e4' }}>{title}</h3>
      <p className="mt-1.5 text-sm" style={{ color: '#78716c' }}>{description}</p>
      {action && (
        <button onClick={action.onClick} className="mt-5 rounded-xl px-5 py-2 text-sm font-semibold transition-all hover:scale-[1.03]"
          style={{ background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff8eb', boxShadow: '0 0 20px rgba(217,119,6,0.4)' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

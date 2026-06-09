import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} animate-[slideUp_0.25s_ease-out] overflow-hidden`}
        style={{ borderRadius: '1rem', border: '1px solid rgba(251,191,36,0.15)', background: '#111009', boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}>
        {/* Top amber accent */}
        <div style={{ background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.5), transparent)' }} className="absolute inset-x-0 top-0 h-px" />

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(251,191,36,0.1)' }}>
          <h2 id="modal-title" className="text-base font-semibold" style={{ color: '#fef3c7' }}>{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: '#78716c' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} aria-label="Close">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

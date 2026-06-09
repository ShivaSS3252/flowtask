import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium" style={{ color: '#d6d3d1' }}>
            {label}
            {props.required && <span className="ml-1" style={{ color: '#f59e0b' }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-base ${className}`}
          style={error ? { borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="text-xs" style={{ color: '#fca5a5' }}>{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-xs" style={{ color: '#78716c' }}>{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

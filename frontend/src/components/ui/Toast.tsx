import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '14px',
          background: 'rgba(28,18,9,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(251,191,36,0.2)',
          color: '#e7e5e4',
          fontSize: '13px',
          padding: '10px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        },
        success: { iconTheme: { primary: '#d97706', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  );
}

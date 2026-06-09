import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header style={{ borderBottom: '1px solid rgba(251,191,36,0.12)', background: 'rgba(12,10,6,0.85)', backdropFilter: 'blur(20px)' }} className="sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div style={{ background: 'linear-gradient(135deg,#d97706,#92400e)', boxShadow: '0 0 16px rgba(217,119,6,0.5)' }} className="flex h-8 w-8 items-center justify-center rounded-xl">
            <svg className="h-4 w-4 text-amber-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
            </svg>
          </div>
          <span style={{ background: 'linear-gradient(to right,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="text-sm font-bold">
            FlowTask
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }} className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-amber-100">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm" style={{ color: '#a8a29e' }}>
                Hi, <span style={{ color: '#fef3c7', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        )}
      </div>
    </header>
  );
}

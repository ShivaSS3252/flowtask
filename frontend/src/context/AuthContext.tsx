import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { TOKEN_STORAGE_KEY } from '../api/axiosClient';
import type { User } from '../types/auth.types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]   = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user,  setUser]    = useState<User | null>(parseStoredUser);

  const setAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for 401 events dispatched by the Axios interceptor
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, setAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}

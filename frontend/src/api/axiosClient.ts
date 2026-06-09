import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'auth_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Let the AuthContext / ProtectedRoute react to the missing token
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  },
);

export const TOKEN_STORAGE_KEY = TOKEN_KEY;

/** Extract user-facing message from an Axios error response. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message[0]
        : data.message;
    }
    if (error.message) return error.message;
  }
  return 'An unexpected error occurred';
}

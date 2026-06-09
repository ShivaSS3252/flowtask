import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../api/auth.api';
import { getErrorMessage } from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { LoginDto } from '../types/auth.types';

const FEATURES = [
  { icon: '⚡', text: 'Capture tasks in seconds' },
  { icon: '🎯', text: 'Prioritize what matters most' },
  { icon: '✓',  text: 'Track progress effortlessly' },
];

export function LoginPage() {
  const { isAuthenticated, setAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginDto>();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (data: LoginDto) => {
    setServerError('');
    try {
      const result = await login(data);
      setAuth(result.accessToken, result.user);
      navigate('/');
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT — Branding panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1a0f00 0%, #0c0a06 40%, #1c0e00 100%)' }}
      >
        {/* Glow blobs */}
        <div style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 65%)' }}
          className="absolute top-0 left-0 w-[500px] h-[500px] -translate-x-1/3 -translate-y-1/3 animate-[glowPulse_4s_ease-in-out_infinite]" />
        <div style={{ background: 'radial-gradient(circle, rgba(180,83,9,0.2) 0%, transparent 65%)' }}
          className="absolute bottom-0 right-0 w-[400px] h-[400px] translate-x-1/3 translate-y-1/3 animate-[glowPulse_4s_ease-in-out_infinite] [animation-delay:2s]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div style={{ background: 'linear-gradient(135deg,#d97706,#92400e)', boxShadow: '0 0 24px rgba(217,119,6,0.6)' }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl">
            <svg className="h-5 w-5 text-amber-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
            </svg>
          </div>
          <span style={{ background: 'linear-gradient(to right,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            className="text-xl font-bold">FlowTask</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#d97706' }}>
            Your productivity, upgraded
          </p>
          <h1 className="text-5xl font-extrabold leading-tight" style={{ color: '#fef3c7' }}>
            Stop thinking.<br />
            <span style={{ background: 'linear-gradient(to right,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start doing.
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed" style={{ color: '#a8a29e' }}>
            The task manager that gets out of your way and lets you focus on what actually matters.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 animate-[slideUp_0.3s_ease-out]" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <div style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(251,191,36,0.2)' }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm">
                  {f.icon}
                </div>
                <span className="text-sm font-medium" style={{ color: '#d6d3d1' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <p className="text-sm italic" style={{ color: '#57534e' }}>
            "The secret of getting ahead is getting started."
          </p>
          <p className="mt-1 text-xs" style={{ color: '#44403c' }}>— Mark Twain</p>
        </div>
      </div>

      {/* ── RIGHT — Form panel ────────────────────────────────── */}
      <div
        className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-12"
        style={{ background: '#0c0a06' }}
      >
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div style={{ background: 'linear-gradient(135deg,#d97706,#92400e)', boxShadow: '0 0 16px rgba(217,119,6,0.5)' }}
            className="flex h-8 w-8 items-center justify-center rounded-xl">
            <svg className="h-4 w-4 text-amber-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
            </svg>
          </div>
          <span style={{ background: 'linear-gradient(to right,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            className="font-bold">FlowTask</span>
        </div>

        <div className="w-full max-w-sm animate-[slideUp_0.28s_ease-out]">
          <h2 className="text-3xl font-bold" style={{ color: '#fef3c7' }}>Sign in</h2>
          <p className="mt-2 text-sm" style={{ color: '#78716c' }}>Welcome back — pick up right where you left off.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" required
              error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
            />

            {/* Password with eye toggle */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#d6d3d1' }}>
                Password <span style={{ color: '#f59e0b' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-base pr-10"
                  style={errors.password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                  style={{ color: '#78716c' }}
                >
                  {showPassword
                    ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  }
                </button>
              </div>
              {errors.password && <p className="text-xs" style={{ color: '#fca5a5' }}>{errors.password.message}</p>}
            </div>

            {serverError && (
              <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
                className="rounded-xl px-4 py-3 text-sm">{serverError}</div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
          </form>

          <p className="mt-6 text-sm" style={{ color: '#78716c' }}>
            New here?{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: '#fbbf24' }}>
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

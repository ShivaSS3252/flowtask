import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../api/auth.api';
import { getErrorMessage } from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { RegisterDto } from '../types/auth.types';

const STATS = [
  { value: '10x', label: 'More productive' },
  { value: '0',   label: 'Missed deadlines' },
  { value: '100%', label: 'In your control' },
];

const EyeIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export function RegisterPage() {
  const { isAuthenticated, setAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterDto & { confirmPassword: string }>();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (data: RegisterDto & { confirmPassword: string }) => {
    setServerError('');
    try {
      const { confirmPassword: _, ...dto } = data;
      void _;
      const result = await registerUser(dto);
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
        <div style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 65%)' }}
          className="absolute top-0 right-0 w-[500px] h-[500px] translate-x-1/3 -translate-y-1/3 animate-[glowPulse_4s_ease-in-out_infinite]" />
        <div style={{ background: 'radial-gradient(circle, rgba(180,83,9,0.2) 0%, transparent 65%)' }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] -translate-x-1/3 translate-y-1/3 animate-[glowPulse_4s_ease-in-out_infinite] [animation-delay:2s]" />

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
            Join thousands of doers
          </p>
          <h1 className="text-5xl font-extrabold leading-tight" style={{ color: '#fef3c7' }}>
            Your goals.<br />
            <span style={{ background: 'linear-gradient(to right,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your timeline.
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed" style={{ color: '#a8a29e' }}>
            Build habits. Hit goals. Stay focused. FlowTask makes it simple to manage everything on your plate.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="text-center animate-[slideUp_0.3s_ease-out]" style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}>
                <p className="text-3xl font-extrabold" style={{ background: 'linear-gradient(to right,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {s.value}
                </p>
                <p className="mt-1 text-xs" style={{ color: '#78716c' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-sm italic" style={{ color: '#57534e' }}>
            "A goal without a plan is just a wish."
          </p>
          <p className="mt-1 text-xs" style={{ color: '#44403c' }}>— Antoine de Saint-Exupery</p>
        </div>
      </div>

      {/* ── RIGHT — Form panel ────────────────────────────────── */}
      <div
        className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-12 overflow-y-auto"
        style={{ background: '#0c0a06' }}
      >
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div style={{ background: 'linear-gradient(135deg,#d97706,#92400e)' }} className="flex h-8 w-8 items-center justify-center rounded-xl">
            <svg className="h-4 w-4 text-amber-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
            </svg>
          </div>
          <span style={{ background: 'linear-gradient(to right,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-bold">FlowTask</span>
        </div>

        <div className="w-full max-w-sm animate-[slideUp_0.28s_ease-out]">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'linear-gradient(135deg,#d97706,#92400e)', boxShadow: '0 0 18px rgba(217,119,6,0.4)' }}>
              <svg className="w-5 h-5" style={{ color: '#fff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#fef3c7' }}>Create account</h2>
          </div>
          <p className="mt-2 text-sm" style={{ color: '#78716c' }}>Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
            <Input label="Full name" type="text" placeholder="Jane Doe" autoComplete="name" required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
            />
            <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" required
              error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
            />
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#d6d3d1' }}>
                Password <span style={{ color: '#f59e0b' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="input-base pr-10"
                  style={errors.password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                    pattern: { value: /^(?=.*[a-zA-Z])(?=.*[0-9])/, message: 'Must contain a letter and a number' },
                  })}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(s => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                  style={{ color: '#78716c' }}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password
                ? <p className="text-xs" style={{ color: '#fca5a5' }}>{errors.password.message}</p>
                : <p className="text-xs" style={{ color: '#78716c' }}>At least one letter and one number</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#d6d3d1' }}>
                Confirm password <span style={{ color: '#f59e0b' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="input-base pr-10"
                  style={errors.confirmPassword ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: val => val === watch('password') || 'Passwords do not match',
                  })}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(s => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                  style={{ color: '#78716c' }}>
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs" style={{ color: '#fca5a5' }}>{errors.confirmPassword.message}</p>}
            </div>

            {serverError && (
              <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
                className="rounded-xl px-4 py-3 text-sm">{serverError}</div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Create account
              </span>
            </Button>
          </form>

          <p className="mt-6 text-sm" style={{ color: '#78716c' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: '#fbbf24' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

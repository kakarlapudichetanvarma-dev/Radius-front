import { useState, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Zap, Lock, Users, Phone, Video, MoreVertical } from 'lucide-react';
import { loginSchema } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';
import type { LoginRequest } from '../types/auth.types';

const SMOOTH = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { val: '<10ms',   label: 'Latency' },
  { val: '256-bit', label: 'Encryption' },
  { val: '99.9%',   label: 'Uptime' },
] as const;

const FEATURES = [
  { icon: Zap,    label: 'Instant delivery' },
  { icon: Shield, label: 'End-to-end encrypted' },
  { icon: Users,  label: 'Team workspaces' },
  { icon: Lock,   label: 'Access control' },
] as const;

const MESSAGES = [
  { msg: "Hey! Files received ✅",     own: false, time: "10:22" },
  { msg: "Perfect, sending more now.", own: true,  time: "10:23" },
  { msg: "Amazing speed 🚀",           own: false, time: "10:23" },
  { msg: "Radius is 🔥",               own: true,  time: "10:24" },
] as const;

const TRUST = [
  { icon: Shield, text: 'E2E Encrypted' },
  { icon: Lock,   text: 'Zero-knowledge' },
  { icon: Zap,    text: 'SOC 2 Ready' },
] as const;

// Memoized — never re-renders
const RadiusLogo = memo(function RadiusLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="#1a0533" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="none" stroke="#7c3aed" strokeWidth="0.6" opacity="0.3" />
      <circle cx="24" cy="20" r="13" fill="none" stroke="#7c3aed" strokeWidth="1.2" opacity="0.22" />
      <circle cx="24" cy="20" r="8.5" fill="none" stroke="#a855f7" strokeWidth="1.3" opacity="0.48" />
      <circle cx="24" cy="20" r="4.5" fill="none" stroke="#c084fc" strokeWidth="1.4" opacity="0.82" />
      <circle cx="24" cy="20" r="1.6" fill="#e9d5ff" />
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = (deg - 90) * Math.PI / 180;
        return <line key={deg}
          x1={24 + Math.cos(rad) * 5.5} y1={20 + Math.sin(rad) * 5.5}
          x2={24 + Math.cos(rad) * 14}  y2={20 + Math.sin(rad) * 14}
          stroke={i < 3 ? "#c084fc" : "#7c3aed"} strokeWidth="1.2" strokeLinecap="round"
          opacity={i < 3 ? 0.88 : 0.38} />;
      })}
      <rect x="7" y="34" width="34" height="10" rx="5" fill="#7c3aed" />
      <circle cx="15" cy="39" r="1.7" fill="#e9d5ff" opacity="0.95" />
      <circle cx="22" cy="39" r="1.7" fill="#e9d5ff" opacity="0.62" />
      <circle cx="29" cy="39" r="1.7" fill="#e9d5ff" opacity="0.30" />
      <rect x="30" y="31" width="13" height="8" rx="2.5" fill="#4c1d95" opacity="0.75" />
      <circle cx="34" cy="35" r="1.1" fill="#c084fc" />
      <circle cx="37.5" cy="35" r="1.1" fill="#c084fc" opacity="0.55" />
      <circle cx="41" cy="35" r="1.1" fill="#c084fc" opacity="0.25" />
    </svg>
  );
});

// Memoized static left panel — never re-renders on form state changes
const LeftPanel = memo(function LeftPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: SMOOTH }}
      className="hidden lg:flex flex-col w-[55%] relative px-14 py-10 border-r border-violet-200 overflow-hidden gap-8"
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform' }}
    >
      {/* Radar rings — isolated so they don't affect parent renders */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[350, 550, 750].map((size, i) => (
          <motion.div
            key={size}
            animate={{ scale: [1, 1.14 + i * 0.08, 1], opacity: [0.07, 0.18, 0.07] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.6, ease: 'easeInOut' }}
            className="absolute top-[42%] left-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/30"
            style={{ width: size, height: size, willChange: 'transform, opacity' }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <RadiusLogo />
        <span className="text-2xl font-bold tracking-wide text-violet-700">Radius</span>
      </div>

      {/* Hero copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: SMOOTH }}
        className="relative z-10"
      >
        <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-3 text-slate-900">
          The future of<br />
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">team messaging.</span>
        </h2>
        <p className="text-slate-500 text-base leading-relaxed max-w-sm">
          Radius gives your team a fast, private, and beautifully simple place to communicate — from anywhere.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: SMOOTH }}
        className="relative z-10 grid grid-cols-3 gap-3"
      >
        {STATS.map(({ val, label }) => (
          <div key={label} className="p-4 rounded-2xl border border-violet-100 bg-white/70 backdrop-blur text-center shadow-sm">
            <div className="text-2xl font-extrabold text-violet-600">{val}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: SMOOTH }}
        className="relative z-10 flex flex-wrap gap-2"
      >
        {FEATURES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-xs">
            <Icon className="w-4 h-4 text-violet-500" aria-hidden="true" />
            {label}
          </div>
        ))}
      </motion.div>

      {/* Chat mockup */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.55, ease: SMOOTH }}
        className="relative z-10 flex-1 flex flex-col"
      >
        <div className="flex-1 rounded-2xl border border-violet-200 bg-white overflow-hidden shadow-xl shadow-violet-500/10 flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">A</div>
              <div>
                <p className="font-semibold text-sm text-slate-900">Alex Morgan</p>
                <p className="text-emerald-500 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />online
                </p>
              </div>
            </div>
            <div className="flex gap-3 text-slate-400" aria-hidden="true">
              <Phone className="w-4 h-4" /><Video className="w-4 h-4" /><MoreVertical className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1 p-5 space-y-3 overflow-hidden bg-slate-50">
            {MESSAGES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.12, ease: SMOOTH }}
                className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${m.own ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                  {m.msg}
                  <span className={`text-[10px] ml-2 ${m.own ? 'text-violet-200' : 'text-slate-400'}`}>{m.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="h-10 rounded-full bg-slate-100 flex items-center px-4 text-slate-400 text-sm gap-2">
              <span className="flex-1">Message...</span>
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="relative z-10 text-slate-400 text-xs"
      >
        Trusted by teams worldwide · Built for speed & privacy
      </motion.p>
    </motion.div>
  );
});

export default function LoginPage() {
  const { login, loading, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => { await login(data); };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex overflow-hidden relative">

      {/* BACKGROUND BLOBS — static, no JS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-300/30 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-violet-400/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-300/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,1) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* LEFT PANEL — memoized, never re-renders on form changes */}
      <LeftPanel />

      {/* RIGHT PANEL — only this subtree re-renders on form interaction */}
      <div className="flex-1 flex items-center justify-center px-8 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: SMOOTH }}
          className="w-full max-w-[400px] flex flex-col gap-7"
          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3">
            <RadiusLogo />
            <span className="text-xl font-bold tracking-wide text-violet-700">Radius</span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1.5 text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to continue to your workspace.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm"
              role="alert"
            >
              <span className="mt-0.5 shrink-0" aria-hidden="true">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Email address</label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200"
              />
              {errors.email && <p className="text-red-500 text-xs" role="alert">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-violet-600 text-xs hover:text-violet-500 transition-colors duration-200">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs" role="alert">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>Sign In <span className="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">→</span></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4" aria-hidden="true">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs uppercase tracking-widest">secure login</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TRUST.map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-violet-100 bg-violet-50 text-center">
                <Icon className="w-3.5 h-3.5 text-violet-500" aria-hidden="true" />
                <span className="text-slate-500 text-[10px] leading-tight">{text}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-600 font-semibold hover:text-violet-500 transition-colors duration-200">Create one free →</Link>
          </p>

          <p className="text-center text-slate-400 text-[11px] leading-relaxed">
            By signing in you agree to our{' '}
            <Link to="/terms" className="hover:text-violet-600 underline transition-colors">Terms</Link>{' '}and{' '}
            <Link to="/privacy" className="hover:text-violet-600 underline transition-colors">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>

      <style>{`* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }`}</style>
    </div>
  );
}
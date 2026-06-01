import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Users, Phone, Video, MoreVertical } from 'lucide-react';
import { useOtp } from '../../hooks/useOtp';

/* ─── constants ─── */

const SMOOTH = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { val: '<10ms',   label: 'Latency' },
  { val: '256-bit', label: 'Encryption' },
  { val: '99.9%',   label: 'Uptime' },
] as const;

const FEATURES = [
  { icon: <Zap className="w-4 h-4" />,    label: 'Instant delivery' },
  { icon: <Shield className="w-4 h-4" />, label: 'End-to-end encrypted' },
  { icon: <Users className="w-4 h-4" />,  label: 'Team workspaces' },
  { icon: <Lock className="w-4 h-4" />,   label: 'Access control' },
] as const;

const MESSAGES = [
  { msg: "Your OTP: keep it secret 🔐",   own: false, time: "10:01" },
  { msg: "Verified in seconds ✅",         own: true,  time: "10:01" },
  { msg: "Identity confirmed 🛡️",          own: false, time: "10:02" },
  { msg: "Welcome to Radius! 🚀",         own: true,  time: "10:02" },
] as const;

const TRUST = [
  { icon: <Shield className="w-3.5 h-3.5" />, text: 'E2E Encrypted' },
  { icon: <Lock className="w-3.5 h-3.5" />,   text: 'Zero-knowledge' },
  { icon: <Zap className="w-3.5 h-3.5" />,    text: 'SOC 2 Ready' },
] as const;

/* ─── sub-components ─── */

function RadiusLogo() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      <div className="logo-wave absolute" />
      <div className="logo-wave absolute" style={{ animationDelay: '1s' }} />
      <div className="logo-wave absolute" style={{ animationDelay: '2s' }} />
      <div className="w-3 h-3 bg-yellow-400 rounded-full z-20 shadow-[0_0_14px_#facc15]" />
    </div>
  );
}

/* ─── main ─── */

const OtpForm = () => {
  const { verifyOtp, pendingEmail, loading, error } = useOtp();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtp({ email: pendingEmail, otp: otp.join('') });
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden relative">

      {/* AMBIENT GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[140px] bg-yellow-400/4" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-yellow-500/3" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[130px] bg-yellow-400/3" />
      </div>

      {/* ═══════════════ LEFT PANEL ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: SMOOTH }}
        className="hidden lg:flex flex-col w-[55%] relative px-14 py-10 border-r border-yellow-400/8 overflow-hidden gap-8"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      >
        {/* Grid texture */}
        <div className="absolute inset-0 matte-grid opacity-[0.07] pointer-events-none" />

        {/* Radar rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[350, 550, 750].map((size, i) => (
            <motion.div
              key={size}
              animate={{ scale: [1, 1.14 + i * 0.08, 1], opacity: [0.07, 0.16, 0.07] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.6, ease: 'easeInOut' }}
              className="absolute top-[42%] left-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/15"
              style={{ width: size, height: size, willChange: 'transform, opacity' }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <RadiusLogo />
          <span className="text-2xl font-bold tracking-wide text-yellow-400">Radius</span>
        </div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: SMOOTH }}
          className="relative z-10"
        >
          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-3">
            One step away<br />
            <span className="text-yellow-400">from your team.</span>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            Enter the 6-digit code we sent to your email to verify your identity and access your workspace.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: SMOOTH }}
          className="relative z-10 grid grid-cols-3 gap-3"
        >
          {STATS.map(({ val, label }) => (
            <div key={label} className="p-4 rounded-2xl border border-yellow-400/12 bg-yellow-400/[0.03] text-center">
              <div className="text-2xl font-extrabold text-yellow-400">{val}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: SMOOTH }}
          className="relative z-10 flex flex-wrap gap-2"
        >
          {FEATURES.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/8 bg-white/[0.03] text-zinc-400 text-xs">
              <span className="text-yellow-400">{icon}</span>
              {label}
            </div>
          ))}
        </motion.div>

        {/* Chat preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: SMOOTH }}
          className="relative z-10 flex-1 flex flex-col"
        >
          <div className="flex-1 rounded-2xl border border-yellow-400/12 bg-[#090909] overflow-hidden shadow-[0_0_60px_rgba(250,204,21,0.05)] flex flex-col">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm">R</div>
                <div>
                  <p className="font-semibold text-sm">Radius Security</p>
                  <p className="text-green-400 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    verification active
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-zinc-600">
                <Phone className="w-4 h-4" />
                <Video className="w-4 h-4" />
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 p-5 space-y-3 overflow-hidden">
              {MESSAGES.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.12, ease: SMOOTH }}
                  className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
                    m.own
                      ? 'bg-yellow-400 text-black font-medium rounded-br-sm'
                      : 'bg-white/[0.06] text-zinc-200 rounded-bl-sm'
                  }`}>
                    {m.msg}
                    <span className={`text-[10px] ml-2 ${m.own ? 'text-black/40' : 'text-zinc-600'}`}>{m.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <div className="h-10 rounded-full bg-white/[0.05] flex items-center px-4 text-zinc-600 text-sm gap-2">
                <span className="flex-1">Message...</span>
                <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="black">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="relative z-10 text-zinc-600 text-xs"
        >
          OTP expires in 10 minutes · Do not share with anyone
        </motion.p>
      </motion.div>

      {/* ═══════════════ RIGHT PANEL ═══════════════ */}
      <div className="flex-1 flex items-center justify-center px-8 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: SMOOTH }}
          className="w-full max-w-[400px] flex flex-col gap-7"
          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3">
            <RadiusLogo />
            <span className="text-xl font-bold tracking-wide text-yellow-400">Radius</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1.5">Verify your identity</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              We sent a 6-digit code to{' '}
              <span className="text-yellow-400 font-medium">{pendingEmail}</span>.
              Enter it below to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm"
            >
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* OTP inputs */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Verification code</label>
              <div className="flex gap-3 justify-between">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.06, ease: SMOOTH }}
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border transition-all duration-200 focus:outline-none
                      ${digit
                        ? 'bg-yellow-400/10 border-yellow-400/60 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)]'
                        : 'bg-white/[0.04] border-white/10 text-white focus:border-yellow-400/60 focus:bg-white/[0.06]'
                      }`}
                  />
                ))}
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1.5 mt-1">
                {otp.map((digit, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                      digit ? 'bg-yellow-400' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="text-zinc-600 text-xs text-right">{filled}/6 digits entered</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || filled < 6}
              className="group w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all duration-200 shadow-[0_0_30px_rgba(250,204,21,0.2)] hover:shadow-[0_0_45px_rgba(250,204,21,0.38)] enabled:hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-zinc-600 text-xs uppercase tracking-widest">secure verification</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2">
            {TRUST.map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/6 bg-white/[0.02] text-center">
                <span className="text-yellow-400">{icon}</span>
                <span className="text-zinc-500 text-[10px] leading-tight">{text}</span>
              </div>
            ))}
          </div>

          {/* Help text */}
          <div className="text-center space-y-1.5">
            <p className="text-zinc-500 text-sm">Didn't receive the code?</p>
            <p className="text-zinc-600 text-xs">Check your spam folder or wait a moment — codes can take up to 60 seconds to arrive.</p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .matte-grid {
          background-image:
            linear-gradient(rgba(250,204,21,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,0.05) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .logo-wave {
          width: 12px; height: 12px;
          border: 1.5px solid #facc15;
          border-radius: 9999px;
          animation: logoRadar 3s linear infinite;
          will-change: transform, opacity;
        }
        @keyframes logoRadar {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0;   }
        }
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `}</style>
    </div>
  );
};

export default OtpForm;
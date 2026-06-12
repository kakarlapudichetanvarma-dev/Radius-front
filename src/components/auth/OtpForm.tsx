import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Users, Phone, Video, MoreVertical } from 'lucide-react';
import { useOtp } from '../../hooks/useOtp';

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
  { msg: "Your OTP: keep it secret 🔐",  own: false, time: "10:01" },
  { msg: "Verified in seconds ✅",        own: true,  time: "10:01" },
  { msg: "Identity confirmed 🛡️",         own: false, time: "10:02" },
  { msg: "Welcome to Radius! 🚀",        own: true,  time: "10:02" },
] as const;

const TRUST = [
  { icon: <Shield className="w-3.5 h-3.5" />, text: 'E2E Encrypted' },
  { icon: <Lock className="w-3.5 h-3.5" />,   text: 'Zero-knowledge' },
  { icon: <Zap className="w-3.5 h-3.5" />,    text: 'SOC 2 Ready' },
] as const;

function RadiusLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
}

const OtpForm = () => {
  const { verifyOtp, pendingEmail, loading, error } = useOtp();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await verifyOtp({ email: pendingEmail, otp: otp.join('') }); };
  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-300/30 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-violet-400/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-300/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: SMOOTH }}
        className="hidden lg:flex flex-col w-[55%] relative px-14 py-10 border-r border-violet-200 overflow-hidden gap-8"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[350, 550, 750].map((size, i) => (
            <motion.div key={size}
              animate={{ scale: [1, 1.14 + i * 0.08, 1], opacity: [0.07, 0.18, 0.07] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.6, ease: 'easeInOut' }}
              className="absolute top-[42%] left-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/30"
              style={{ width: size, height: size }} />
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3"><RadiusLogo /><span className="text-2xl font-bold tracking-wide text-violet-700">Radius</span></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: SMOOTH }} className="relative z-10">
          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-3 text-slate-900">One step away<br /><span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">from your team.</span></h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-sm">Enter the 6-digit code we sent to your email to verify your identity.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35, ease: SMOOTH }} className="relative z-10 grid grid-cols-3 gap-3">
          {STATS.map(({ val, label }) => (
            <div key={label} className="p-4 rounded-2xl border border-violet-100 bg-white/70 backdrop-blur text-center shadow-sm">
              <div className="text-2xl font-extrabold text-violet-600">{val}</div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: SMOOTH }} className="relative z-10 flex flex-wrap gap-2">
          {FEATURES.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-xs">
              <span className="text-violet-500">{icon}</span>{label}
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.55, ease: SMOOTH }} className="relative z-10 flex-1 flex flex-col">
          <div className="flex-1 rounded-2xl border border-violet-200 bg-white overflow-hidden shadow-xl shadow-violet-500/10 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">R</div>
                <div><p className="font-semibold text-sm text-slate-900">Radius Security</p><p className="text-emerald-500 text-xs flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />verification active</p></div>
              </div>
              <div className="flex gap-3 text-slate-400"><Phone className="w-4 h-4" /><Video className="w-4 h-4" /><MoreVertical className="w-4 h-4" /></div>
            </div>
            <div className="flex-1 p-5 space-y-3 overflow-hidden bg-slate-50">
              {MESSAGES.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 + i * 0.12, ease: SMOOTH }} className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${m.own ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                    {m.msg}<span className={`text-[10px] ml-2 ${m.own ? 'text-violet-200' : 'text-slate-400'}`}>{m.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="h-10 rounded-full bg-slate-100 flex items-center px-4 text-slate-400 text-sm gap-2">
                <span className="flex-1">Message...</span>
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.9 }} className="relative z-10 text-slate-400 text-xs">
          OTP expires in 10 minutes · Do not share with anyone
        </motion.p>
      </motion.div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-8 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: SMOOTH }}
          className="w-full max-w-[400px] flex flex-col gap-7"
          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        >
          <div className="flex lg:hidden items-center justify-center gap-3"><RadiusLogo /><span className="text-xl font-bold tracking-wide text-violet-700">Radius</span></div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1.5 text-slate-900">Verify your identity</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              We sent a 6-digit code to <span className="text-violet-600 font-medium">{pendingEmail}</span>. Enter it below.
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <span className="mt-0.5 shrink-0">⚠</span><span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Verification code</label>
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
                        ? 'bg-violet-50 border-violet-400 text-violet-700 ring-2 ring-violet-100'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
                      }`}
                  />
                ))}
              </div>
              <div className="flex gap-1.5 mt-1">
                {otp.map((digit, i) => (
                  <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${digit ? 'bg-violet-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className="text-slate-400 text-xs text-right">{filled}/6 digits entered</p>
            </div>

            <button type="submit" disabled={loading || filled < 6}
              className="group w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-violet-500/30 enabled:hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Verifying...</>
              ) : (<>Verify Code <span className="group-hover:translate-x-1 transition-transform duration-200">→</span></>)}
            </button>
          </form>

          <div className="flex items-center gap-4"><div className="flex-1 h-px bg-slate-200" /><span className="text-slate-400 text-xs uppercase tracking-widest">secure verification</span><div className="flex-1 h-px bg-slate-200" /></div>

          <div className="grid grid-cols-3 gap-2">
            {TRUST.map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-violet-100 bg-violet-50 text-center">
                <span className="text-violet-500">{icon}</span><span className="text-slate-500 text-[10px] leading-tight">{text}</span>
              </div>
            ))}
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-slate-500 text-sm">Didn't receive the code?</p>
            <p className="text-slate-400 text-xs">Check your spam folder or wait — codes can take up to 60 seconds.</p>
          </div>
        </motion.div>
      </div>
      <style>{`* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }`}</style>
    </div>
  );
};

export default OtpForm;
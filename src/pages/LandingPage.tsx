import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, MessageSquare,
  Phone, Video, MoreVertical,
  Files, Lock, Users
} from 'lucide-react';

/* ─── constants (defined once, never re-allocated on render) ─── */

type Phase = 'clash-in' | 'hold' | 'clash-out' | 'done';

const EASE = [0.76, 0, 0.24, 1] as const;
const SMOOTH = [0.22, 1, 0.36, 1] as const;

const TOP_Y:    Record<Phase, string> = { 'clash-in': '0%', hold: '0%', 'clash-out': '-100%', done: '-100%' };
const BOTTOM_Y: Record<Phase, string> = { 'clash-in': '0%', hold: '0%', 'clash-out':  '100%', done:  '100%' };

const PANEL_TRANS: Record<Phase, { duration: number; ease?: typeof EASE }> = {
  'clash-in':  { duration: 0.85, ease: EASE },
  hold:        { duration: 0 },
  'clash-out': { duration: 0.80, ease: EASE },
  done:        { duration: 0 },
};

const STATS = [
  { val: '<10ms',  label: 'Message Latency' },
  { val: '256-bit', label: 'Encryption' },
  { val: '99.9%',  label: 'Uptime SLA' },
] as const;

const MESSAGES = [
  { msg: "Hey! Are you there? 👋",       own: false, time: "10:22" },
  { msg: "Yo! What's up?",               own: true,  time: "10:23" },
  { msg: "Sending the project files now.", own: false, time: "10:23" },
  { msg: "Got them ✅ Perfect!",          own: true,  time: "10:24" },
  { msg: "Amazing speed! 🚀",            own: false, time: "10:24" },
] as const;

const FEATURE_ROWS = [
  { icon: <Zap className="w-5 h-5 text-yellow-400" />,           text: "Instant real-time message delivery" },
  { icon: <Files className="w-5 h-5 text-yellow-400" />,         text: "Share images, videos, PDFs and files" },
  { icon: <MessageSquare className="w-5 h-5 text-yellow-400" />, text: "Create groups and chat together" },
  { icon: <Shield className="w-5 h-5 text-yellow-400" />,        text: "End-to-end encrypted by default" },
];

const FEATURE_CARDS = [
  { icon: <Zap className="w-7 h-7 text-yellow-400" />,           title: "Instant Delivery",     desc: "Messages arrive in under 10ms. Real-time delivery means no waiting, no refresh needed.",                      delay: 0   },
  { icon: <Files className="w-7 h-7 text-yellow-400" />,         title: "File Sharing",         desc: "Share images, videos, PDFs, documents and any type of file — no compression, full quality.",                 delay: 0.1 },
  { icon: <Shield className="w-7 h-7 text-yellow-400" />,        title: "End-to-End Encrypted", desc: "Your messages are private by design. 256-bit encryption keeps every conversation secure.",                   delay: 0.2 },
  { icon: <MessageSquare className="w-7 h-7 text-yellow-400" />, title: "Group Chats",          desc: "Create groups, manage conversations and stay connected with your whole team or community.",                  delay: 0.3 },
  { icon: <Users className="w-7 h-7 text-yellow-400" />,         title: "Team Spaces",          desc: "Organize conversations by project, team or topic and keep everyone on the same page.",                      delay: 0.4 },
  { icon: <Lock className="w-7 h-7 text-yellow-400" />,          title: "Access Control",       desc: "Granular permissions for groups, admins and members so everyone sees exactly what they should.",             delay: 0.5 },
];

const RADAR_SIZES = [640, 880, 1120] as const;

/* ─── main component ─── */

export default function LandingPage() {
  const navigate = useNavigate();
  // Replace the existing useState + useEffect with this:

const [phase, setPhase] = useState<Phase>(() =>
  localStorage.getItem('radius_intro_done') === '1' ? 'done' : 'clash-in'
);

useEffect(() => {
  if (phase === 'done') return; // already done from localStorage, skip timers

  const t1 = setTimeout(() => setPhase('hold'),      800);
  const t2 = setTimeout(() => setPhase('clash-out'), 2000);
  const t3 = setTimeout(() => {
    setPhase('done');
    localStorage.setItem('radius_intro_done', '1'); // mark as played
  }, 2900);

  return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
}, []);

  const isDone       = phase === 'done';
  const showOverlay  = !isDone;
  const showLogo     = phase === 'hold' || phase === 'clash-out';
  const showGoldSeam = phase === 'hold';

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* ─── PAGE CONTENT ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isDone ? 1 : 0 }}
        transition={{ duration: 1.1, ease: SMOOTH }}
        className={`relative z-10 min-h-screen flex flex-col ${isDone ? 'visible' : 'invisible'}`}
      >
        {/* BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 matte-grid opacity-[0.12]" />
          <div className="absolute top-[-300px] left-[-200px] w-[900px] h-[900px] rounded-full blur-[220px] bg-yellow-400/5" />
          <div className="absolute bottom-[-300px] right-[-200px] w-[900px] h-[900px] rounded-full blur-[220px] bg-yellow-500/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px] bg-yellow-400/3" />
        </div>

        {/* HEADER */}
        <header className="sticky top-0 z-40 px-8 py-5 flex justify-between items-center border-b border-yellow-400/10 bg-black/50 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <RadiusLogo />
            <span className="text-2xl font-bold tracking-wide text-yellow-400">Radius</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
            <a href="#features" className="hover:text-yellow-400 transition-colors duration-200">Features</a>
            <a href="#security" className="hover:text-yellow-400 transition-colors duration-200">Security</a>
            <a href="#team"     className="hover:text-yellow-400 transition-colors duration-200">Team</a>
          </nav>
          <div className="flex gap-3 items-center">
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors duration-200">
              Log In
            </button>
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-yellow-400 text-black rounded-xl text-sm font-bold hover:bg-yellow-300 hover:scale-105 transition-all duration-200">
              Get Started
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 relative flex flex-col items-center overflow-hidden">

          {/* RADAR RINGS */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {RADAR_SIZES.map((size, i) => (
              <motion.div
                key={size}
                animate={{ scale: [1, 1.18 + i * 0.12, 1], opacity: [0.10, 0.20, 0.10] }}
                transition={{ duration: 5 + i * 2, repeat: Infinity, delay: i * 1.4, ease: 'easeInOut' }}
                className="absolute top-[14%] left-1/2 -translate-x-1/2 rounded-full border border-yellow-400/15"
                style={{ width: size, height: size, willChange: 'transform, opacity' }}
              />
            ))}
          </div>

          {/* HERO */}
          <section className="relative z-20 flex flex-col items-center text-center pt-24 pb-8 px-6 w-full max-w-5xl mx-auto">

            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: isDone ? 1 : 0, y: isDone ? 0 : -14 }}
              transition={{ duration: 0.7, delay: 0.1, ease: SMOOTH }}
              className="mb-8 px-5 py-2 rounded-full border border-green-400/25 bg-green-400/8 flex items-center gap-3 text-green-300 text-sm backdrop-blur-xl"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Real-time messaging platform — now available
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: isDone ? 1 : 0, y: isDone ? 0 : 40 }}
              transition={{ duration: 1, delay: 0.2, ease: SMOOTH }}
              className="text-7xl md:text-9xl font-extrabold tracking-[0.15em] text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.45)] mb-6"
              style={{ willChange: 'transform, opacity' }}
            >
              RADIUS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isDone ? 1 : 0, y: isDone ? 0 : 20 }}
              transition={{ duration: 1, delay: 0.35, ease: SMOOTH }}
              className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed mb-3"
            >
              Fast, secure and modern messaging built for real-time communication.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isDone ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="text-base text-zinc-600 max-w-xl mb-12"
            >
              Connect with your team, share files instantly, and stay in sync — everywhere.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isDone ? 1 : 0, y: isDone ? 0 : 10 }}
              transition={{ duration: 0.8, delay: 0.6, ease: SMOOTH }}
              className="flex gap-4 flex-wrap justify-center mb-20"
            >
              <button onClick={() => navigate('/register')} className="group px-10 py-4 bg-yellow-400 text-black rounded-full font-bold text-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-200 shadow-[0_0_45px_rgba(250,204,21,0.28)]">
                Start Messaging
                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
              <button onClick={() => navigate('/login')} className="px-10 py-4 border border-yellow-400/30 rounded-full text-yellow-400 hover:bg-yellow-400/8 hover:border-yellow-400/60 transition-all duration-200">
                Open Radius
              </button>
            </motion.div>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isDone ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
              className="flex gap-14 justify-center flex-wrap"
            >
              {STATS.map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{val}</div>
                  <div className="text-xs text-zinc-600 mt-1 uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </motion.div>
          </section>

          <GoldDivider />

          {/* CHAT DEMO */}
          <section id="features" className="relative z-20 w-full max-w-7xl px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: SMOOTH }}
              >
                <div className="inline-block px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-6">
                  Real-time chat
                </div>
                <h2 className="text-5xl font-bold leading-tight mb-6">
                  The Future Of<span className="text-yellow-400"> Messaging</span>
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                  Send messages instantly, share any type of file, create groups and stay connected with everyone in real-time.
                </p>
                <div className="space-y-5">
                  {FEATURE_ROWS.map(({ icon, text }) => (
                    <FeatureRow key={text} icon={icon} text={text} />
                  ))}
                </div>
              </motion.div>

              {/* PHONE MOCKUP */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: SMOOTH }}
                className="mx-auto"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/5 blur-[70px] rounded-full scale-75" />
                  <div className="relative w-[340px] h-[680px] rounded-[44px] border border-yellow-400/15 bg-[#090909] p-3 shadow-[0_0_100px_rgba(250,204,21,0.08)]">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
                    <div className="w-full h-full rounded-[36px] overflow-hidden bg-[#080808] flex flex-col">
                      <div className="p-4 pt-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm">A</div>
                          <div>
                            <h3 className="font-semibold text-sm">Alex Morgan</h3>
                            <p className="text-green-400 text-xs flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                              online
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-zinc-600">
                          <Phone className="w-4 h-4" />
                          <Video className="w-4 h-4" />
                          <MoreVertical className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1 p-4 space-y-3">
                        {MESSAGES.map((m, i) => (
                          <div key={i} className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[78%] px-3 py-2.5 rounded-2xl text-sm leading-snug ${
                              m.own
                                ? 'bg-yellow-400 text-black font-medium rounded-br-sm'
                                : 'bg-white/[0.06] text-zinc-200 rounded-bl-sm'
                            }`}>
                              {m.msg}
                              <span className={`text-[10px] ml-2 ${m.own ? 'text-black/40' : 'text-zinc-600'}`}>{m.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                        <div className="h-11 rounded-full bg-white/[0.06] flex items-center px-4 text-zinc-600 text-sm gap-2">
                          <span className="flex-1">Message...</span>
                          <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="black">
                              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <GoldDivider />

          {/* FEATURE CARDS */}
          <section id="security" className="relative z-20 w-full max-w-7xl px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: SMOOTH }}
              className="text-center mb-16"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-6">
                Why Radius
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Built For Modern Messaging</h2>
              <p className="text-zinc-500 text-lg max-w-xl mx-auto">Everything you need. Nothing you don't.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURE_CARDS.map(({ icon, title, desc, delay }) => (
                <FeatureCard key={title} icon={icon} title={title} desc={desc} delay={delay} />
              ))}
            </div>
          </section>

          <GoldDivider />

          {/* CTA */}
          <section id="team" className="relative z-20 mb-32 px-8 w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: SMOOTH }}
              className="relative rounded-[40px] border border-yellow-400/15 bg-white/[0.025] backdrop-blur-3xl p-16 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-yellow-400/[0.03] rounded-[40px]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Chatting Today</h2>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
                  Connect instantly with modern real-time messaging. Free to start, scales with your team.
                </p>
                <button onClick={() => navigate('/register')} className="group px-12 py-5 bg-yellow-400 text-black rounded-full font-bold text-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-200 shadow-[0_0_60px_rgba(250,204,21,0.35)]">
                  Create Free Account
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
                </button>
                <p className="mt-5 text-zinc-600 text-sm">No credit card required</p>
              </div>
            </motion.div>
          </section>

          <RadiusFooter />
        </main>
      </motion.div>

      {/* ─── CLASH ANIMATION OVERLAY ─── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div key="overlay" className="fixed inset-0 z-[999] pointer-events-none">

            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 bg-[#060606]"
              initial={{ y: '-100%' }}
              animate={{ y: TOP_Y[phase], transition: PANEL_TRANS[phase] }}
              style={{ willChange: 'transform' }}
            >
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            </motion.div>

            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-[#060606]"
              initial={{ y: '100%' }}
              animate={{ y: BOTTOM_Y[phase], transition: PANEL_TRANS[phase] }}
              style={{ willChange: 'transform' }}
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            </motion.div>

            <AnimatePresence>
              {showGoldSeam && (
                <motion.div
                  key="seam"
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.div
                    className="absolute w-full h-[120px] -top-[60px] bg-gradient-to-b from-transparent via-yellow-400/15 to-transparent"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="relative w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {showLogo && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <motion.span
                  className="text-5xl font-black tracking-[0.35em] text-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.55)]"
                  initial={{ opacity: 0, letterSpacing: '0.55em' }}
                  animate={{ opacity: 1, letterSpacing: '0.35em' }}
                  transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
                >
                  RADIUS
                </motion.span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        html { scroll-behavior: smooth; }
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
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  );
}

/* ─── sub-components ─── */

function GoldDivider() {
  return (
    <div className="w-full max-w-5xl px-8 my-24">
      <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
    </div>
  );
}

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

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <p className="text-zinc-300 text-base">{text}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      className="p-8 rounded-3xl bg-white/[0.025] backdrop-blur-2xl border border-white/8 hover:border-yellow-400/25 transition-colors duration-300 group"
      style={{ willChange: 'transform' }}
    >
      <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 group-hover:bg-yellow-400/15 flex items-center justify-center mb-7 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-500 text-base leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function RadiusFooter() {
  return (
    <footer className="relative z-20 w-full border-t border-yellow-400/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center flex-col md:flex-row gap-6">
        <div className="flex items-center gap-3">
          <RadiusLogo />
          <span className="text-2xl font-bold text-yellow-400">Radius</span>
        </div>
        <div className="flex gap-8 text-sm text-zinc-600">
          <a href="#" className="hover:text-yellow-400 transition-colors duration-200">Privacy</a>
          <a href="#" className="hover:text-yellow-400 transition-colors duration-200">Terms</a>
          <a href="#" className="hover:text-yellow-400 transition-colors duration-200">Contact</a>
        </div>
        <p className="text-zinc-600 text-sm">© 2026 Radius. All rights reserved.</p>
      </div>
    </footer>
  );
}
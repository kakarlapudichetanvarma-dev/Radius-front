import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Zap, MessageSquare,
  Phone, Video, MoreVertical,
  Files, Lock, Users
} from 'lucide-react';

const STATS = [
  { val: '<10ms',   label: 'Message Latency' },
  { val: '256-bit', label: 'Encryption' },
  { val: '99.9%',   label: 'Uptime SLA' },
] as const;

const MESSAGES = [
  { msg: "Hey! Are you there? 👋",        own: false, time: "10:22" },
  { msg: "Yo! What's up?",                own: true,  time: "10:23" },
  { msg: "Sending the project files now.", own: false, time: "10:23" },
  { msg: "Got them ✅ Perfect!",          own: true,  time: "10:24" },
  { msg: "Amazing speed! 🚀",             own: false, time: "10:24" },
] as const;

const FEATURE_ROWS = [
  { icon: <Zap size={18} />,    text: "Instant real-time message delivery" },
  { icon: <Files size={18} />,  text: "Share images, videos, PDFs and files" },
  { icon: <Users size={18} />,  text: "Create groups and chat together" },
  { icon: <Lock size={18} />,   text: "End-to-end encrypted by default" },
];

const FEATURE_CARDS = [
  { icon: <Zap size={28} />,           title: "Instant Delivery",     desc: "Messages arrive in under 10ms. Real-time delivery means no waiting, no refresh needed.",       delay: 0   },
  { icon: <Files size={28} />,         title: "File Sharing",         desc: "Share images, videos, PDFs, documents and any type of file — no compression, full quality.",  delay: 0.1 },
  { icon: <Lock size={28} />,          title: "End-to-End Encrypted", desc: "Your messages are private by design. 256-bit encryption keeps every conversation secure.",    delay: 0.2 },
  { icon: <Users size={28} />,         title: "Group Chats",          desc: "Create groups, manage conversations and stay connected with your whole team or community.",   delay: 0.3 },
  { icon: <MessageSquare size={28} />, title: "Team Spaces",          desc: "Organize conversations by project, team or topic and keep everyone on the same page.",        delay: 0.4 },
  { icon: <Shield size={28} />,        title: "Access Control",       desc: "Granular permissions for groups, admins and members so everyone sees exactly what they should.", delay: 0.5 },
];

const RADAR_SIZES = [640, 880, 1120] as const;

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white text-slate-900">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-300/30 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-violet-400/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-300/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2.5">
          <RadiusIcon size={36} />
          <span className="text-xl font-bold tracking-tight">Radius</span>
        </div>
        <nav className="hidden gap-8 md:flex">
          <a href="#features" className="text-sm text-slate-600 hover:text-violet-600 transition-colors">Features</a>
          <a href="#security" className="text-sm text-slate-600 hover:text-violet-600 transition-colors">Security</a>
          <a href="#team" className="text-sm text-slate-600 hover:text-violet-600 transition-colors">Team</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors">
            Log In
          </button>
          <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 hover:scale-105 transition-all shadow-lg shadow-violet-500/30">
            Get Started
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 mx-auto max-w-7xl px-8">

        {/* RADAR RINGS */}
        <div className="pointer-events-none absolute left-1/2 top-32 -translate-x-1/2">
          {RADAR_SIZES.map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full border border-violet-400/20"
              style={{
                width: size, height: size,
                left: -size / 2, top: -size / 2,
                animation: `logoRadar 4s ease-out ${i * 1.2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* HERO */}
        <section className="relative pt-20 pb-32 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            Real-time messaging platform — now available
          </div>

          <div className="mb-6 flex justify-center">
            <RadiusIcon size={80} />
          </div>

          <h1 className="bg-gradient-to-br from-slate-900 via-violet-700 to-fuchsia-600 bg-clip-text text-7xl font-black tracking-tight text-transparent md:text-9xl">
            RADIUS
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-xl text-slate-700">
            Fast, secure and modern messaging built for real-time communication.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-base text-slate-500">
            Connect with your team, share files instantly, and stay in sync — everywhere.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => navigate('/register')} className="group px-10 py-4 bg-violet-600 text-white rounded-full font-bold text-lg hover:bg-violet-700 hover:scale-105 transition-all shadow-[0_10px_45px_rgba(139,92,246,0.45)]">
              Start Messaging <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button onClick={() => navigate('/login')} className="px-10 py-4 border border-violet-300 rounded-full text-violet-700 hover:bg-violet-50 hover:border-violet-500 transition-all">
              Open Radius
            </button>
          </div>

          {/* STATS */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
            {STATS.map(({ val, label }) => (
              <div key={label} className="rounded-2xl border border-violet-100 bg-white/70 backdrop-blur p-6 shadow-sm">
                <p className="text-3xl font-black text-violet-600">{val}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <VioletDivider />

        {/* CHAT DEMO */}
        <section id="features" className="py-24">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                Real-time chat
              </div>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                The Future Of Messaging
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Send messages instantly, share any type of file, create groups and stay connected with everyone in real-time.
              </p>
              <ul className="mt-8 space-y-4">
                {FEATURE_ROWS.map(({ icon, text }) => (
                  <FeatureRow key={text} icon={icon} text={text} />
                ))}
              </ul>
            </div>

            {/* PHONE MOCKUP */}
            <div className="relative">
              <div className="mx-auto w-full max-w-sm rounded-[2.5rem] border border-violet-200 bg-white p-3 shadow-2xl shadow-violet-500/20">
                <div className="rounded-[2rem] bg-slate-50 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white">A</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Alex Morgan</p>
                        <p className="flex items-center gap-1 text-xs text-emerald-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          online
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-slate-400">
                      <Phone size={16} />
                      <Video size={16} />
                      <MoreVertical size={16} />
                    </div>
                  </div>
                  <div className="space-y-3 px-4 py-4 h-80 overflow-y-auto">
                    {MESSAGES.map((m, i) => (
                      <div key={i} className={`flex ${m.own ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.own ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                          <p>{m.msg}</p>
                          <p className={`mt-1 text-[10px] ${m.own ? 'text-violet-200' : 'text-slate-400'}`}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                      <span className="flex-1 text-sm text-slate-400">Message...</span>
                      <button className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-white">
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <VioletDivider />

        {/* FEATURE CARDS */}
        <section className="py-24">
          <div className="mb-16 text-center">
            <div className="mb-3 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
              Why Radius
            </div>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">Built For Modern Messaging</h2>
            <p className="mt-3 text-lg text-slate-600">Everything you need. Nothing you don't.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map(({ icon, title, desc, delay }) => (
              <FeatureCard key={title} icon={icon} title={title} desc={desc} delay={delay} />
            ))}
          </div>
        </section>

        <VioletDivider />

        {/* CTA */}
        <section className="py-24">
          <div className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-16 text-center shadow-xl shadow-violet-500/10">
            <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 flex justify-center">
                <RadiusIcon size={56} />
              </div>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl">Start Chatting Today</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
                Connect instantly with modern real-time messaging. Free to start, scales with your team.
              </p>
              <button onClick={() => navigate('/register')} className="group mt-8 px-12 py-5 bg-violet-600 text-white rounded-full font-bold text-lg hover:bg-violet-700 hover:scale-105 transition-all shadow-[0_15px_60px_rgba(139,92,246,0.5)]">
                Create Free Account <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
              <p className="mt-4 text-xs text-slate-500">No credit card required</p>
            </div>
          </div>
        </section>

        <RadiusFooter />
      </main>

      <style>{`
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

function RadiusIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="13" fill="#1a0533" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="none" stroke="#7c3aed" strokeWidth="0.6" opacity="0.3" />
      <circle cx="24" cy="20" r="13" fill="none" stroke="#7c3aed" strokeWidth="1.2" opacity="0.22" />
      <circle cx="24" cy="20" r="8.5" fill="none" stroke="#a855f7" strokeWidth="1.3" opacity="0.48" />
      <circle cx="24" cy="20" r="4.5" fill="none" stroke="#c084fc" strokeWidth="1.4" opacity="0.82" />
      <circle cx="24" cy="20" r="1.6" fill="#e9d5ff" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const x1 = 24 + Math.cos(rad) * 5.5;
        const y1 = 20 + Math.sin(rad) * 5.5;
        const x2 = 24 + Math.cos(rad) * 14;
        const y2 = 20 + Math.sin(rad) * 14;
        return (
          <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i < 3 ? "#c084fc" : "#7c3aed"} strokeWidth="1.2"
            strokeLinecap="round" opacity={i < 3 ? 0.88 : 0.38} />
        );
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

function VioletDivider() {
  return (
    <div className="relative h-px w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-100 text-violet-600">
        {icon}
      </span>
      <span className="text-slate-700">{text}</span>
    </li>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group rounded-2xl border border-violet-100 bg-white p-8 shadow-sm hover:shadow-xl hover:shadow-violet-500/15 hover:-translate-y-1 transition-all"
    >
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function RadiusFooter() {
  return (
    <footer className="border-t border-violet-100 py-12 mt-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <RadiusIcon size={28} />
          <span className="font-bold text-slate-900">Radius</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-violet-600">Privacy</a>
          <a href="#" className="hover:text-violet-600">Terms</a>
          <a href="#" className="hover:text-violet-600">Contact</a>
        </div>
        <p className="text-xs text-slate-400">© 2026 Radius. All rights reserved.</p>
      </div>
    </footer>
  );
}
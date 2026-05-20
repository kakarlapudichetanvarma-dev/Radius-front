import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, MessageSquare } from 'lucide-react';

type Phase = 'clash-in' | 'hold' | 'clash-out' | 'done';

export default function LandingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('clash-in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 750);
    const t2 = setTimeout(() => setPhase('clash-out'), 1700);
    const t3 = setTimeout(() => setPhase('done'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const ease = [0.76, 0, 0.24, 1] as const;

  const topY = { 'clash-in': '0%', hold: '0%', 'clash-out': '-100%', done: '-100%' };
  const bottomY = { 'clash-in': '0%', hold: '0%', 'clash-out': '100%', done: '100%' };
  const panelTrans = {
    'clash-in': { duration: 0.75, ease },
    hold: { duration: 0 },
    'clash-out': { duration: 0.65, ease },
    done: { duration: 0 },
  };

  const showOverlay = phase !== 'done';
  const showLogo = phase === 'hold' || phase === 'clash-out';

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col relative">

      {/* ─── CLASH ANIMATION OVERLAY ─── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Top panel */}
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 bg-[#080808]"
              initial={{ y: '-100%' }}
              animate={{ y: topY[phase], transition: panelTrans[phase] }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#080808] to-[#0d0d00]" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-yellow-400/70 shadow-[0_0_24px_4px_rgba(250,204,21,0.5)]" />
              <div className="absolute bottom-0 left-0 w-20 h-px bg-yellow-400 shadow-[0_0_32px_8px_rgba(250,204,21,0.8)]" />
              <div className="absolute bottom-0 right-0 w-20 h-px bg-yellow-400 shadow-[0_0_32px_8px_rgba(250,204,21,0.8)]" />
            </motion.div>

            {/* Bottom panel */}
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-[#080808]"
              initial={{ y: '100%' }}
              animate={{ y: bottomY[phase], transition: panelTrans[phase] }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-[#0d0d00]" />
              <div className="absolute top-0 inset-x-0 h-px bg-yellow-400/70 shadow-[0_0_24px_4px_rgba(250,204,21,0.5)]" />
              <div className="absolute top-0 left-0 w-20 h-px bg-yellow-400 shadow-[0_0_32px_8px_rgba(250,204,21,0.8)]" />
              <div className="absolute top-0 right-0 w-20 h-px bg-yellow-400 shadow-[0_0_32px_8px_rgba(250,204,21,0.8)]" />
            </motion.div>

            {/* Logo reveal */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  key="logo"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.15 }}
                >
                  {/* sweep line */}
                  <motion.div
                    className="absolute inset-x-0 h-[2px] bg-yellow-400"
                    style={{ top: '50%' }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.55, ease: 'easeOut', times: [0, 0.55, 1] }}
                  />

                  {/* wordmark */}
                  <motion.div
                    className="flex items-center gap-4 relative z-10"
                    initial={{ opacity: 0, scale: 0.65 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <RadiusLogo large />
                    <span
                      className="text-6xl font-black tracking-[0.3em] text-yellow-400"
                      style={{ textShadow: '0 0 40px #facc15, 0 0 80px rgba(250,204,21,0.4)' }}
                    >
                      RADIUS
                    </span>
                  </motion.div>

                  {/* tagline */}
                  <motion.p
                    className="text-xs tracking-[0.4em] uppercase text-yellow-400/70 font-semibold relative z-10"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    Real-time · Encrypted · Premium
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ACTUAL PAGE (always rendered, revealed when panels retract) ─── */}

      {/* Matte Gold Background */}
      {/* ─── ACTUAL PAGE ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'done' ? 1 : 0
        }}
        transition={{
          duration: 0.4
        }}
        className="contents"
      >

        {/* Matte Gold Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 matte-grid opacity-20" />
          <div className="absolute top-[-250px] left-[-200px] w-[800px] h-[800px] bg-yellow-400/8 rounded-full blur-[180px]" />
          <div className="absolute bottom-[-250px] right-[-200px] w-[800px] h-[800px] bg-yellow-400/6 rounded-full blur-[180px]" />
        </div>

        {/* HEADER */}
        <header className="sticky top-0 z-40 px-8 py-6 flex justify-between items-center border-b border-yellow-400/10 bg-white/[0.02] backdrop-blur-2xl">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === 'done' ? 1 : 0
            }}
            className="flex items-center gap-3"
          >
            <RadiusLogo />

            <span className="text-2xl font-bold tracking-wide text-yellow-400">
              Radius
            </span>

          </motion.div>


          <div className="flex gap-4">

            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-yellow-400 hover:text-yellow-300 transition"
            >
              Log In
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-yellow-400 text-black rounded-xl font-semibold hover:scale-105 transition"
            >
              Get Started
            </button>

          </div>

        </header>


        {/* MAIN */}
        <main className="flex-1 relative flex flex-col items-center">

          <div className="relative z-20 flex flex-col items-center text-center pt-24">

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{
                opacity: phase === 'done' ? 1 : 0,
                y: phase === 'done' ? 0 : 35
              }}
              transition={{ duration: 0.8 }}
              className="text-7xl md:text-8xl font-extrabold tracking-[0.3em] text-yellow-400 drop-shadow-[0_0_30px_#facc15] mb-8"
            >
              RADIUS
            </motion.h1>


            <motion.p
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === 'done' ? 1 : 0
              }}
              transition={{ delay: 0.3 }}
              className="text-xl text-zinc-400 max-w-2xl mb-10"
            >
              Communication without compromise.
              Built for speed, privacy, and flawless real-time interaction.
            </motion.p>


            <motion.button
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === 'done' ? 1 : 0
              }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-yellow-400 text-black rounded-full font-bold text-lg hover:scale-105 transition"
            >
              Join Radius
            </motion.button>

          </div>

        </main>

      </motion.div>

      <style>{`
        .matte-grid {
          background-image:
            linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .logo-wave {
          width: 12px;
          height: 12px;
          border: 1.5px solid #facc15;
          border-radius: 9999px;
          animation: logoRadar 3s linear infinite;
        }
        @keyframes logoRadar {
          0%   { transform: scale(1); opacity: .8; }
          100% { transform: scale(3); opacity: 0;  }
        }
      `}</style>
    </div>
  );
}

function RadiusLogo({ large }: { large?: boolean }) {
  const size = large ? 'w-12 h-12' : 'w-9 h-9';
  const dot = large ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      <div className="logo-wave absolute" />
      <div className="logo-wave absolute" style={{ animationDelay: '1s' }} />
      <div className="logo-wave absolute" style={{ animationDelay: '2s' }} />
      <div className={`${dot} bg-yellow-400 rounded-full z-20 shadow-[0_0_12px_#facc15]`} />
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="min-h-[260px] p-10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-yellow-400/30 hover:-translate-y-2 transition-all"
    >
      <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center mb-8">
        {icon}
      </div>
      <h3 className="text-3xl font-bold mb-5">{title}</h3>
      <p className="text-zinc-400 text-lg leading-relaxed">{desc}</p>
    </motion.div>
  );
  function RadiusFooter() {
    return (
      <footer className="
      relative z-20
      w-full
      mt-auto
      border-t border-yellow-400/10
      bg-black/60
      backdrop-blur-xl
    ">

        <div className="
        max-w-7xl
        mx-auto
        px-8
        py-16
      ">

          {/* Top */}
          <div className="
          grid
          grid-cols-1 md:grid-cols-5
          gap-12
        ">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <RadiusLogo />

                <span className="text-2xl font-bold text-yellow-400">
                  Radius
                </span>
              </div>

              <button className="
              px-6 py-3
              bg-yellow-400
              text-black
              rounded-full
              font-semibold
            ">
                Download
              </button>
            </div>


            {/* Column 1 */}
            <div>
              <p className="text-sm text-zinc-500 mb-4">
                Product
              </p>

              <div className="space-y-3 text-zinc-300">
                <p>Features</p>
                <p>Security</p>
                <p>Privacy</p>
                <p>Business</p>
              </div>
            </div>


            {/* Column 2 */}
            <div>
              <p className="text-sm text-zinc-500 mb-4">
                Company
              </p>

              <div className="space-y-3 text-zinc-300">
                <p>About</p>
                <p>Careers</p>
                <p>Brand</p>
                <p>Blog</p>
              </div>
            </div>


            {/* Column 3 */}
            <div>
              <p className="text-sm text-zinc-500 mb-4">
                Platforms
              </p>

              <div className="space-y-3 text-zinc-300">
                <p>Android</p>
                <p>iPhone</p>
                <p>Desktop</p>
                <p>Web</p>
              </div>
            </div>


            {/* Column 4 */}
            <div>
              <p className="text-sm text-zinc-500 mb-4">
                Support
              </p>

              <div className="space-y-3 text-zinc-300">
                <p>Contact</p>
                <p>Help Center</p>
                <p>Apps</p>
                <p>Security</p>
              </div>
            </div>

          </div>



          {/* Bottom */}
          <div className="
          border-t
          border-yellow-400/10
          mt-12
          pt-8

          flex
          flex-col md:flex-row
          justify-between
          items-center
          gap-6
        ">

            <p className="text-zinc-500 text-sm">
              2026 Radius. All rights reserved.
            </p>


            <div className="flex gap-4">

              <div className="
              w-12 h-12
              rounded-full
              border border-zinc-600
              flex items-center justify-center
            ">
                X
              </div>

              <div className="
              w-12 h-12
              rounded-full
              border border-zinc-600
              flex items-center justify-center
            ">
                Y
              </div>

              <div className="
              w-12 h-12
              rounded-full
              border border-zinc-600
              flex items-center justify-center
            ">
                I
              </div>

              <div className="
              w-12 h-12
              rounded-full
              border border-zinc-600
              flex items-center justify-center
            ">
                F
              </div>

            </div>

          </div>

        </div>

      </footer>
    );
  }
}
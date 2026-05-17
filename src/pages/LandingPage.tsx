import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">

      {/* HEADER */}
      <header className="
        sticky top-0 z-50
        px-8 py-6
        flex justify-between items-center
        border-b border-yellow-400/10
        bg-black/70
        backdrop-blur-xl
      ">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >

          <RadiusLogo />

          <span className="
            text-2xl
            font-bold
            tracking-wide
            text-yellow-400
          ">
            Radius
          </span>

        </motion.div>


        <div className="flex gap-4">

          <button
            onClick={() => navigate('/login')}
            className="
              px-6 py-2
              text-yellow-400
              font-medium
              hover:text-yellow-300
              transition
            "
          >
            Log In
          </button>

          <button
            onClick={() => navigate('/register')}
            className="
              px-6 py-2
              bg-yellow-400
              text-black
              rounded-xl
              font-semibold
              hover:scale-105
              transition
            "
          >
            Get Started
          </button>

        </div>

      </header>



      {/* MAIN */}
      <main className="flex-1 relative flex flex-col items-center">


        {/* Glow */}
        <div className="
          absolute
          top-[280px]
          left-1/2
          -translate-x-1/2
          w-[1200px]
          h-[700px]
          bg-yellow-400/12
          rounded-full
          blur-[180px]
        " />


        {/* HERO */}
        <div className="
          relative
          z-20
          flex
          flex-col
          items-center
          text-center
          pt-24
        ">


          {/* Radar Waves */}
          <div className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            pointer-events-none
          ">

            <div className="wave absolute" />

            <div
              className="wave absolute"
              style={{ animationDelay: '1.5s' }}
            />

            <div
              className="wave absolute"
              style={{ animationDelay: '3s' }}
            />

          </div>



          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8 }}
            className="
              text-7xl
              md:text-8xl
              font-extrabold
              tracking-[0.3em]
              text-yellow-400
              drop-shadow-[0_0_25px_#facc15]
              mb-8
              z-20
            "
          >
            RADIUS
          </motion.h1>



          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .4 }}
            className="
              text-xl
              text-zinc-400
              max-w-2xl
              mb-10
            "
          >
            Communication without compromise.
            Built for speed, privacy, and
            flawless real-time interaction.
          </motion.p>



          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .7 }}
            onClick={() => navigate('/register')}
            className="
              px-10
              py-4
              bg-yellow-400
              text-black
              rounded-full
              font-bold
              text-lg
              hover:scale-105
              transition
            "
          >
            Join Radius
          </motion.button>

        </div>



        {/* UPDATED FEATURES */}
        <div className="
          relative z-20
          w-full
          max-w-7xl

          px-12

          mt-40

          grid
          grid-cols-1
          md:grid-cols-3

          gap-12

          pb-24
        ">

          <FeatureCard
            icon={<Zap className="w-7 h-7 text-yellow-400" />}
            title="Real-Time Sync"
            desc="Messages appear instantly. Zero lag, zero waiting."
            delay={1}
          />

          <FeatureCard
            icon={<Shield className="w-7 h-7 text-yellow-400" />}
            title="Total Privacy"
            desc="Secure, encrypted communication built for trust."
            delay={1.2}
          />

          <FeatureCard
            icon={<MessageSquare className="w-7 h-7 text-yellow-400" />}
            title="Crafted Interface"
            desc="Fluid, cinematic and beautifully premium."
            delay={1.4}
          />

        </div>

      </main>



      <style>{`
        .wave {
          width: 20px;
          height: 20px;
          border: 2px solid #facc15;
          border-radius: 9999px;

          animation: radarWave 4.5s linear infinite;
        }

        @keyframes radarWave {

          0% {
            transform: scale(0);
            opacity: .8;
          }

          100% {
            transform: scale(70);
            opacity: 0;
          }

        }
      `}</style>

    </div>
  );
}



/* LOGO */
function RadiusLogo() {
  return (
    <>
      <div className="relative w-9 h-9 flex items-center justify-center">

        <div className="logo-wave absolute" />

        <div
          className="logo-wave absolute"
          style={{ animationDelay: '1s' }}
        />

        <div
          className="logo-wave absolute"
          style={{ animationDelay: '2s' }}
        />

        <div className="
          w-3
          h-3
          bg-yellow-400
          rounded-full
          z-20
          shadow-[0_0_10px_#facc15]
        " />

      </div>


      <style>{`
        .logo-wave {

          width: 12px;
          height: 12px;

          border: 1.5px solid #facc15;
          border-radius: 9999px;

          animation: logoRadar 3s linear infinite;
        }

        @keyframes logoRadar {

          0% {
            transform: scale(1);
            opacity: .8;
          }

          100% {
            transform: scale(3);
            opacity: 0;
          }

        }
      `}</style>

    </>
  );
}



/* CARD */
function FeatureCard({
  icon,
  title,
  desc,
  delay
}: any) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="
        min-h-[260px]

        p-10

        rounded-3xl

        bg-zinc-950/80
        border
        border-yellow-400/10

        backdrop-blur-xl

        hover:border-yellow-400/30
        hover:-translate-y-2

        transition-all
      "
    >

      <div className="
        w-16
        h-16

        rounded-2xl

        bg-yellow-400/10

        flex
        items-center
        justify-center

        mb-8
      ">
        {icon}
      </div>

      <h3 className="
        text-3xl
        font-bold
        mb-5
      ">
        {title}
      </h3>

      <p className="
        text-zinc-400
        text-lg
        leading-relaxed
      ">
        {desc}
      </p>

    </motion.div>
  );
}
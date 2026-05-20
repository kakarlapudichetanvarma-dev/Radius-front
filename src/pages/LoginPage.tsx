import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';
import type { LoginRequest } from '../types/auth.types';


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
          shadow-[0_0_12px_#facc15]
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


export default function LoginPage() {
  const { login, loading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginRequest) => {
    await login(data);
  };

  return (
    <div className="
      min-h-screen
      bg-[#050505]
      text-white
      flex
      items-center
      justify-center
      px-4
      relative
      overflow-hidden
    ">

      {/* background for blur */}
      <div className="
        absolute
        top-[-200px]
        left-[-200px]
        w-[600px]
        h-[600px]
        bg-yellow-400/10
        rounded-full
        blur-[180px]
      " />

      <div className="
        absolute
        bottom-[-200px]
        right-[-200px]
        w-[600px]
        h-[600px]
        bg-yellow-400/8
        rounded-full
        blur-[180px]
      " />


      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          relative
          z-20

          w-full
          max-w-md

          bg-white/[0.03]

          backdrop-blur-2xl

          border
          border-white/10

          shadow-2xl
          shadow-yellow-500/5

          p-8
          rounded-2xl
          space-y-5
        "
      >

        <div className="flex items-center justify-center gap-3">
          <RadiusLogo />

          <span className="text-2xl font-bold tracking-wide text-yellow-400">
            Radius
          </span>
        </div>


        <h1 className="text-3xl font-bold text-center text-yellow-400">
          Login
        </h1>


        {error && (
          <div className="
            bg-red-500/10
            border border-red-500/40
            text-red-400
            rounded-lg
            px-4 py-3
            text-sm
          ">
            {error}
          </div>
        )}


        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className="
              w-full
              p-3
              rounded-lg

              bg-white/[0.02]

              border
              border-white/10

              text-white

              focus:outline-none
              focus:border-yellow-400
            "
          />

          {errors.email && (
            <p className="text-red-400 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>


        <div>
          <input
            type="password"
            {...register('password')}
            placeholder="Enter your password"
            className="
              w-full
              p-3
              rounded-lg
              bg-white/[0.02]
              border
              border-white/10
              text-white
              focus:outline-none
              focus:border-yellow-400
            "
          />

          {errors.password && (
            <p className="text-red-400 text-sm mt-1">
              {errors.password.message}
            </p>
          )}

          {/* ✅ Add this */}
          <div className="text-right mt-2">
            <Link
              to="/forgot-password"
              className="text-yellow-400 text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>


        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            bg-yellow-400
            hover:bg-yellow-500
            text-black
            font-bold
            p-3
            rounded-lg

            shadow-[0_0_20px_rgba(250,204,21,0.15)]
          "
        >
          {loading ? 'Sending OTP...' : 'Login'}
        </button>


        <p className="text-center text-zinc-400 text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-yellow-400 hover:underline"
          >
            Register
          </Link>
        </p>

      </form>

    </div>
  );
}
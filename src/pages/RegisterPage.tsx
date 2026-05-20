import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema } from '../schemas/register.schema';
import { useRegister } from '../hooks/useRegister';
import type { RegisterRequest } from '../types/auth.types';


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

        <div
          className="
            w-3
            h-3
            bg-yellow-400
            rounded-full
            z-20
            shadow-[0_0_10px_#facc15]
          "
        />

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


export default function RegisterPage() {
  const { register: registerUser, loading, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterRequest) => {
    await registerUser(data);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          w-full max-w-md
          bg-zinc-950
          border border-yellow-500/30
          shadow-2xl shadow-yellow-500/10
          p-8
          rounded-2xl
          space-y-5
        "
      >

        {/* Radius Header */}
        <div className="flex items-center justify-center gap-3">
          <RadiusLogo />

          <span className="text-2xl font-bold tracking-wide text-yellow-400">
            Radius
          </span>
        </div>


        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-yellow-400">
          Create Account
        </h1>


        {/* API Error */}
        {error && (
          <div
            className="
              bg-red-500/10
              border border-red-500/40
              text-red-400
              rounded-lg
              px-4
              py-3
              text-sm
            "
          >
            {error}
          </div>
        )}


        {/* Username */}
        <div>
          <input
            {...register('username')}
            placeholder="Enter username"
            className="
              w-full
              p-3
              rounded-lg
              bg-zinc-900
              border border-zinc-700
              text-white
              placeholder:text-zinc-500
              focus:outline-none
              focus:border-yellow-400
              focus:ring-2
              focus:ring-yellow-400/20
              transition
            "
          />

          {errors.username && (
            <p className="text-red-400 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>


        {/* Email */}
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className="
              w-full
              p-3
              rounded-lg
              bg-zinc-900
              border border-zinc-700
              text-white
              placeholder:text-zinc-500
              focus:outline-none
              focus:border-yellow-400
              focus:ring-2
              focus:ring-yellow-400/20
              transition
            "
          />

          {errors.email && (
            <p className="text-red-400 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>


        {/* Phone */}
        <div>
          <input
            {...register('phoneNumber')}
            type="tel"
            placeholder="Enter phone number"
            className="
              w-full
              p-3
              rounded-lg
              bg-zinc-900
              border border-zinc-700
              text-white
              placeholder:text-zinc-500
              focus:outline-none
              focus:border-yellow-400
              focus:ring-2
              focus:ring-yellow-400/20
              transition
            "
          />

          {errors.phoneNumber && (
            <p className="text-red-400 text-sm mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>


        {/* Password */}
        <div>
          <input
            type="password"
            {...register('password')}
            placeholder="Password (min 8 characters)"
            className="
              w-full
              p-3
              rounded-lg
              bg-zinc-900
              border border-zinc-700
              text-white
              placeholder:text-zinc-500
              focus:outline-none
              focus:border-yellow-400
              focus:ring-2
              focus:ring-yellow-400/20
              transition
            "
          />

          {errors.password && (
            <p className="text-red-400 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>


        {/* Submit */}
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
            transition-all
            duration-300
            disabled:bg-yellow-700
            disabled:cursor-not-allowed
          "
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>


        {/* Login Link */}
        <p className="text-center text-zinc-400 text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-yellow-400 hover:text-yellow-300 hover:underline"
          >
            Login
          </Link>
        </p>

      </form>

    </div>
  );
}
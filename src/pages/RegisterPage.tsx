import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema } from '../schemas/register.schema';
import { useRegister } from '../hooks/useRegister';
import type { RegisterRequest } from '../types/auth.types';

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4"
      >
        <h1 className="text-3xl font-bold text-center">Create Account</h1>

        {/* API Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500
                          text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Username */}
        <div>
          <input
            {...register('username')}
            placeholder="Username"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700
                       focus:outline-none focus:border-green-500"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            {...register('email')}
            placeholder="Email"
            type="email"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700
                       focus:outline-none focus:border-green-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            {...register('phoneNumber')}
            placeholder="Phone Number"
            type="tel"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700
                       focus:outline-none focus:border-green-500"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">
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
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700
                       focus:outline-none focus:border-green-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700
                     disabled:bg-green-900 disabled:cursor-not-allowed
                     p-3 rounded font-bold transition-colors"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        {/* Login Link */}
        <p className="text-center text-zinc-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:underline">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}
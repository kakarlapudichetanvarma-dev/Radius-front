import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';
import type { LoginRequest } from '../types/auth.types';

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4"
      >
        <h1 className="text-3xl font-bold text-center">Login</h1>

        {/* API Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500
                          text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

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

        {/* Password */}
        <div>
          <input
            type="password"
            {...register('password')}
            placeholder="Password"
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
          {loading ? 'Sending OTP...' : 'Login'}
        </button>

        {/* Register Link */}
        <p className="text-center text-zinc-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 hover:underline">
            Register
          </Link>
        </p>

      </form>
    </div>
  );
}
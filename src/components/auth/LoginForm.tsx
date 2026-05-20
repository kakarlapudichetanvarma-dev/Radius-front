import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import type { LoginRequest } from '../../types/auth.types';

const LoginForm = () => {
  const { login, loading, error } = useLogin();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-yellow-400/8 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-yellow-400/6 rounded-full blur-[160px]" />

      <div className="
        relative z-20
        bg-white/[0.03]
        backdrop-blur-2xl
        border border-white/10
        shadow-2xl shadow-yellow-500/5
        p-8 rounded-2xl
        w-full max-w-md
      ">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">
            Welcome Back
          </h1>
          <p className="text-zinc-400 mt-2">
            Login to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="
                w-full
                bg-white/[0.02]
                border border-white/10
                text-white
                rounded-lg
                px-4 py-3
                focus:outline-none
                focus:border-yellow-400
              "
            />
          </div>


          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="
                w-full
                bg-white/[0.02]
                border border-white/10
                text-white
                rounded-lg
                px-4 py-3
                focus:outline-none
                focus:border-yellow-400
              "
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-yellow-400
              hover:bg-yellow-500
              text-black
              font-semibold
              py-3
              rounded-lg
            "
          >
            {loading ? 'Sending OTP...' : 'Login'}
          </button>

        </form>


        <p className="text-center text-zinc-400 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-yellow-400 hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginForm;
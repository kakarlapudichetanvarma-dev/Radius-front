import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';
import type { RegisterRequest } from '../../types/auth.types';

const RegisterForm = () => {
  const { register, loading, error } = useRegister();

  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    phoneNumber: '',
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
    await register(formData);
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
            Create Account
          </h1>
          <p className="text-zinc-400 mt-2">
            Join and start chatting
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {['username','email','phoneNumber','password'].map((field) => (
            <input
              key={field}
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              required
              placeholder={field}
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
          ))}

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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>


        <p className="text-center text-zinc-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-400 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterForm;
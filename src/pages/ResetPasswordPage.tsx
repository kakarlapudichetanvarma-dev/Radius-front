import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useResetPassword } from '../hooks/useResetPassword';

export default function ResetPasswordPage() {
  const location = useLocation();
  const prefillEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: prefillEmail,
    otp: '',
    newPassword: ''
  });

  const { resetPassword, loading, error } = useResetPassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(formData);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-[180px]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-yellow-400/8 rounded-full blur-[180px]" />

      <div className="relative z-20 w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl shadow-yellow-500/5 p-8 rounded-2xl space-y-5">

        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400">Reset Password</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Enter the OTP sent to your email and your new password.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">OTP</label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              placeholder="Enter OTP from email"
              className="w-full p-3 rounded-lg bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Minimum 8 characters"
              className="w-full p-3 rounded-lg bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-3 rounded-lg disabled:bg-yellow-700 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm">
          <Link to="/login" className="text-yellow-400 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
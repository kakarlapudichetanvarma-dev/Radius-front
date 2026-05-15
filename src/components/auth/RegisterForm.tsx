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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">Create Account</h1>
          <p className="text-gray-400 mt-2">Join and start chatting</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400
                          rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3
                         border border-gray-600 focus:outline-none
                         focus:border-green-400 placeholder-gray-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3
                         border border-gray-600 focus:outline-none
                         focus:border-green-400 placeholder-gray-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3
                         border border-gray-600 focus:outline-none
                         focus:border-green-400 placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3
                         border border-gray-600 focus:outline-none
                         focus:border-green-400 placeholder-gray-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-800
                       disabled:cursor-not-allowed text-white font-semibold
                       py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterForm;
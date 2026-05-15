import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOtp } from '../hooks/useOtp';
import { otpSchema } from '../schemas/otp.schema';
import type { OtpRequest } from '../types/auth.types';

export default function OtpPage() {
  const { verifyOtp, pendingEmail, loading, error } = useOtp();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OtpRequest>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: pendingEmail  // ← auto fill email
    }
  });

  const onSubmit = async (data: OtpRequest) => {
    await verifyOtp(data);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-zinc-900 p-8 rounded-xl space-y-4"
      >
        <h1 className="text-3xl font-bold text-center">Verify OTP</h1>

        <p className="text-center text-zinc-400 text-sm">
          Code sent to{' '}
          <span className="text-green-400">{pendingEmail}</span>
        </p>

        {/* API Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500
                          text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Email (hidden but registered) */}
        <input
          {...register('email')}
          type="hidden"
        />

        {/* OTP Input */}
        <div>
          <input
            {...register('otp')}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700
                       focus:outline-none focus:border-green-500
                       text-center text-2xl tracking-widest"
          />
          {errors.otp && (
            <p className="text-red-500 text-sm mt-1">
              {errors.otp.message}
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
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

      </form>
    </div>
  );
}
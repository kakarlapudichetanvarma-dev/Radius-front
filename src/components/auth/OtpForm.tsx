import { useState, useRef, useEffect } from 'react';
import { useOtp } from '../../hooks/useOtp';

const OtpForm = () => {
  const { verifyOtp, pendingEmail, loading, error } = useOtp();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only one digit
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move back on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    await verifyOtp({
      email: pendingEmail,
      otp: otpString
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">Verify OTP</h1>
          <p className="text-gray-400 mt-2">
            Enter the 6-digit code sent to
          </p>
          <p className="text-green-400 font-medium mt-1">
            {pendingEmail || 'your email'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400
                          rounded-lg px-4 py-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit}>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-bold
                           bg-gray-700 text-white rounded-lg
                           border-2 border-gray-600
                           focus:outline-none focus:border-green-400
                           transition-colors duration-200"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-green-500 hover:bg-green-600
                       disabled:bg-green-800 disabled:cursor-not-allowed
                       text-white font-semibold py-3 rounded-lg
                       transition-colors duration-200"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

        </form>

        {/* Resend Note */}
        <p className="text-center text-gray-500 mt-6 text-sm">
          Didn't receive the code? Check your spam folder.
        </p>

      </div>
    </div>
  );
};

export default OtpForm;
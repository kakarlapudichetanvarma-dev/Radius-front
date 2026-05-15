import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8">
      
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-400">WhatsApp Clone</h1>
        <p className="text-zinc-400 mt-3 text-lg">
          Connect with anyone, anywhere.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        
        <button
          onClick={() => navigate('/login')}
          className="bg-green-600 hover:bg-green-700 text-white
                     font-semibold px-8 py-3 rounded-lg
                     transition-colors duration-200"
        >
          Login
        </button>

        <button
          onClick={() => navigate('/register')}
          className="bg-zinc-800 hover:bg-zinc-700 text-white
                     font-semibold px-8 py-3 rounded-lg
                     border border-zinc-600
                     transition-colors duration-200"
        >
          Register
        </button>

      </div>

    </div>
  );
}
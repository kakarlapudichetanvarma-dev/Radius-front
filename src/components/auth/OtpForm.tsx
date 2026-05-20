import { useState, useRef, useEffect } from 'react';
import { useOtp } from '../../hooks/useOtp';


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

        <div className="
          w-3
          h-3
          bg-yellow-400
          rounded-full
          z-20
          shadow-[0_0_12px_#facc15]
        " />

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


const OtpForm = () => {
  const { verifyOtp, pendingEmail, loading, error } = useOtp();

  const [otp, setOtp] = useState<string[]>([
    '', '', '', '', '', ''
  ]);

  const inputRefs =
    useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (
    index:number,
    value:string
  ) => {

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] =
      value.slice(-1);

    setOtp(newOtp);

    if(value && index < 5){
      inputRefs
        .current[index + 1]
        ?.focus();
    }

  };

  const handleKeyDown = (
    index:number,
    e:React.KeyboardEvent
  ) => {

    if(
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ){

      inputRefs
        .current[index - 1]
        ?.focus();

    }

  };

  const handleSubmit =
    async (
      e:React.FormEvent
    ) => {

      e.preventDefault();

      await verifyOtp({
        email: pendingEmail,
        otp: otp.join('')
      });

    };

  return (
    <div className="
      min-h-screen
      bg-[#0a0a0a]

      flex
      items-center
      justify-center

      px-4

      relative
      overflow-hidden
    ">

      {/* background glow */}
      <div className="
        absolute
        top-[-200px]
        left-[-200px]

        w-[600px]
        h-[600px]

        bg-yellow-400/8

        rounded-full

        blur-[160px]
      " />

      <div className="
        absolute
        bottom-[-200px]
        right-[-200px]

        w-[600px]
        h-[600px]

        bg-yellow-400/6

        rounded-full

        blur-[160px]
      " />


      <div className="
        relative
        z-20

        bg-white/[0.03]

        backdrop-blur-2xl

        border
        border-white/10

        shadow-2xl
        shadow-yellow-500/5

        p-8
        rounded-2xl

        w-full
        max-w-md
      ">

        {/* logo */}
        <div className="
          flex
          items-center
          justify-center
          gap-3
          mb-6
        ">

          <RadiusLogo />

          <span className="
            text-2xl
            font-bold
            text-yellow-400
          ">
            Radius
          </span>

        </div>


        {/* header */}
        <div className="
          text-center
          mb-8
        ">

          <h1 className="
            text-3xl
            font-bold
            text-yellow-400
          ">
            Verify OTP
          </h1>

          <p className="
            text-zinc-400
            mt-2
          ">
            {pendingEmail}
          </p>

        </div>


        {/* error */}
        {error && (
          <div className="
            bg-red-500/10

            border
            border-red-500

            text-red-400

            rounded-lg

            px-4
            py-3

            mb-6

            text-sm
            text-center
          ">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit}>


          {/* otp */}
          <div className="
            flex
            gap-3
            justify-center
            mb-8
          ">

            {otp.map(
              (
                digit,
                index
              ) => (

                <input
                  key={index}

                  ref={(el)=>{
                    inputRefs.current[index]=el;
                  }}

                  value={digit}

                  onChange={(e)=>
                    handleChange(
                      index,
                      e.target.value
                    )
                  }

                  onKeyDown={(e)=>
                    handleKeyDown(
                      index,
                      e
                    )
                  }

                  maxLength={1}

                  className="
                    w-12
                    h-12

                    text-center
                    text-xl
                    font-bold

                    text-white

                    bg-white/[0.02]

                    border
                    border-white/10

                    rounded-lg

                    focus:outline-none
                    focus:border-yellow-400
                  "
                />

              )
            )}

          </div>


          {/* button */}
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

            {loading
              ? 'Verifying...'
              : 'Verify OTP'
            }

          </button>

        </form>

      </div>

    </div>
  );
};

export default OtpForm;
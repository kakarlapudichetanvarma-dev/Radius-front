interface Props {
  user: string;

  onClose: () => void;
}

export default function CallModal({
  user,

  onClose
}: Props) {
  return (
    <div
      className="
        fixed
        inset-0
        bg-black/80
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div
        className="
          bg-zinc-900
          p-8
          rounded-xl
          text-center
          space-y-4
        "
      >
        <h2
          className="
            text-2xl
            font-bold
          "
        >
          Calling...
        </h2>

        <p>
          {user}
        </p>

        <button
          onClick={
            onClose
          }

          className="
            bg-red-600
            px-4
            py-2
            rounded-xl
          "
        >
          End Call
        </button>

      </div>
    </div>
  );
}
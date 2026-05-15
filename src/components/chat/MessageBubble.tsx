import { motion } from 'framer-motion';

interface Props {
  sender: string;

  type?: 'chat' | 'system';

  text?: string;

  image?: string;

  fileName?: string;

  time: string;

  status:
    | 'sent'
    | 'delivered'
    | 'read';
}

export default function MessageBubble({
  sender,

  type,

  text,

  image,

  fileName,

  time,

  status
}: Props) {
  if (
    type ===
    'system'
  ) {
    return (
      <div
        className="
          text-center
          text-sm
          text-zinc-400
        "
      >
        {text}
      </div>
    );
  }

  const isMine =
    sender === 'me';

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 0.2
      }}

      className={
        isMine
          ? 'text-right'
          : 'text-left'
      }
    >
      <div
        className={`
          inline-block
          px-4
          py-2
          rounded-2xl
          max-w-[70%]
          ${
            isMine
              ? 'bg-green-700'
              : 'bg-zinc-800'
          }
        `}
      >
        {text && (
          <p>
            {text}
          </p>
        )}

        {image && (
          <img
            src={image}

            alt="chat"

            className="
              rounded-xl
              mt-2
              max-w-[250px]
            "
          />
        )}

        {fileName && (
          <div
            className="
              mt-2
              underline
            "
          >
            📎 {fileName}
          </div>
        )}

        <div
          className="
            text-xs
            mt-1
            text-zinc-300
            flex
            gap-1
            justify-end
          "
        >
          <span>
            {time}
          </span>

          {isMine && (
            <span>
              {status}
            </span>
          )}
        </div>

      </div>
    </motion.div>
  );
}
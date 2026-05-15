import {
  useState
} from 'react';

import {
  useDispatch
} from 'react-redux';

import VueWrapper from '../../vue/VueWrapper';

import {
  sendMessage
} from '../../store/slices/chat.slice';

export default function MessageInput() {
  const dispatch =
    useDispatch();

  const [text, setText] =
    useState('');

  const [
    showEmoji,
    setShowEmoji
  ] = useState(false);

  const handleSend = () => {
    if (!text.trim())
      return;

    dispatch(
      sendMessage({
        id:
          Date.now().toString(),

        sender: 'me',

        text,

        time: 'now',

        status:
          'sent'
      })
    );

    setText('');
  };

  const handleEmoji =
    (
      emoji: string
    ) => {
      setText(
        previous =>
          previous +
          emoji
      );

      setShowEmoji(
        false
      );
    };

  return (
    <div className="relative">

      {showEmoji && (
        <div
          className="
            absolute
            bottom-20
            left-4
            z-50
          "
        >
          <VueWrapper
            onSelect={
              handleEmoji
            }
          />
        </div>
      )}

      <div
        className="
          h-16
          bg-zinc-900
          border-t
          border-zinc-800
          flex
          items-center
          gap-2
          px-4
        "
      >
        <button
          onClick={() =>
            setShowEmoji(
              previous =>
                !previous
            )
          }

          className="
            text-2xl
          "
        >
          😀
        </button>

        <input
          value={text}

          onChange={e =>
            setText(
              e.target.value
            )
          }

          placeholder="Type message..."

          className="
            flex-1
            p-3
            rounded-xl
            bg-zinc-800
            outline-none
          "
        />

        <button
          onClick={
            handleSend
          }

          className="
            bg-green-600
            px-4
            py-2
            rounded-xl
          "
        >
          Send
        </button>

      </div>
    </div>
  );
}
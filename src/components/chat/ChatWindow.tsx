import { useSelector } from 'react-redux';

import MessageBubble from './MessageBubble';

import type { RootState } from '../../store';

export default function ChatWindow() {
  const messages =
    useSelector(
      (state: RootState) =>
        state.chat.messages
    );

  return (
    <div
      className="
        flex-1
        p-4
        space-y-4
        overflow-y-auto
        bg-zinc-950
      "
    >
      {messages.map(
        message => (
          <MessageBubble
            key={message.id}

            sender={
              message.sender
            }

            type={
              message.type
            }

            text={
              message.text
            }

            image={
              message.image
            }

            fileName={
              message.fileName
            }

            time={
              message.time
            }

            status={
              message.status
            }
          />
        )
      )}
    </div>
  );
}
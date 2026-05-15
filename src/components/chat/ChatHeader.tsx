import {
  useState
} from 'react';

import {
  useSelector
} from 'react-redux';
import {
  createOffer
} from '../../webrtc/peer.service';

import {
  sendOffer
} from '../../webrtc/signaling.service';
import type {
  RootState
} from '../../store';

import CallButton
  from '../call/CallButton';

import CallModal
  from '../call/CallModal';

import {
  getAudioStream
} from '../../webrtc/media.service';

export default function ChatHeader() {
  const [
    calling,
    setCalling
  ] = useState(false);

  const selectedChat =
    useSelector(
      (
        state:
          RootState
      ) =>
        state.chat
          .selectedChat
    );

  const typingUser =
    useSelector(
      (
        state:
          RootState
      ) =>
        state.chat
          .typingUser
    );

  const handleCall =
    async () => {
      try {
        const stream =
  await getAudioStream();

const offer =
  await createOffer(
    stream
  );

sendOffer(
  offer
);

setCalling(
  true
);
      } catch (error) {
  console.error(
    'Microphone error:',
    error
  );

  alert(
    'Microphone access failed. Check browser permissions.'
  );
}
    };

  return (
    <>
      {calling && (
        <CallModal
          user={
            selectedChat ||
            ''
          }

          onClose={() =>
            setCalling(
              false
            )
          }
        />
      )}

      <div
        className="
          h-16
          bg-zinc-900
          border-b
          border-zinc-800
          flex
          items-center
          justify-between
          px-4
        "
      >
        <div>

          <p>
            {
              selectedChat ||
              'Select a chat'
            }
          </p>

          {typingUser && (
            <p
              className="
                text-sm
                text-green-500
              "
            >
              {
                typingUser
              } is typing...
            </p>
          )}

        </div>

        {selectedChat && (
          <CallButton
            onClick={
              handleCall
            }
          />
        )}

      </div>
    </>
  );
}
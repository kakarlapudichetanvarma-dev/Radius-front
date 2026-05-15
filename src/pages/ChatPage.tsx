import {
  useEffect
} from 'react';

import MainLayout
  from '../layouts/MainLayout';

import Sidebar
  from '../components/chat/Sidebar';

import ChatHeader
  from '../components/chat/ChatHeader';

import ChatWindow
  from '../components/chat/ChatWindow';

import MessageInput
  from '../components/chat/MessageInput';

import IncomingCallModal
  from '../components/call/IncomingCallModal';

import {
  connectMessages
} from '../socket/message.events';

import {
  connectTyping
} from '../socket/typing.events';

import {
  connectPresence
} from '../socket/presence.events';

import {
  store
} from '../store';

import {
  receiveCall
} from '../store/slices/call.slice';

export default function ChatPage() {
  useEffect(() => {
    connectMessages();

    connectTyping();

    connectPresence();

    const timer =
      setTimeout(
        () =>
          store.dispatch(
            receiveCall(
              'Sami'
            )
          ),

        5000
      );

    return () =>
      clearTimeout(
        timer
      );
  }, []);

  return (
    <MainLayout>

      <IncomingCallModal />

      <div
        className="
          grid
          grid-cols-12
          h-full
        "
      >

        <div
          className="
            col-span-4
          "
        >
          <Sidebar />
        </div>

        <div
          className="
            col-span-8
            flex
            flex-col
          "
        >
          <ChatHeader />

          <ChatWindow />

          <MessageInput />
        </div>

      </div>

    </MainLayout>
  );
}
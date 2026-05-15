import {
  useDispatch,

  useSelector
} from 'react-redux';

import type {
  RootState
} from '../../store';

import {
  setSelectedChat,

  setTyping,

  clearTyping
} from '../../store/slices/chat.slice';

const friends = [
  'Sami',
  'Vami',
  'Rahul'
];

export default function FriendList() {
  const dispatch =
    useDispatch();

  const onlineUsers =
    useSelector(
      (
        state:
          RootState
      ) =>
        state.chat
          .onlineUsers
    );

  const handleClick = (
    friend: string
  ) => {
    dispatch(
      setSelectedChat({
  name:
    friend,

  isGroup:
    false
})
    );

    dispatch(
      setTyping(
        friend
      )
    );

    setTimeout(
      () =>
        dispatch(
          clearTyping()
        ),

      3000
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">

      {friends.map(
        friend => (
          <button
            key={friend}

            onClick={() =>
              handleClick(
                friend
              )
            }

            className="
              w-full
              text-left
              p-4
              border-b
              border-zinc-800
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <div
                className={`
                  w-3
                  h-3
                  rounded-full
                  ${
                    onlineUsers.includes(
                      friend
                    )
                      ? 'bg-green-500'
                      : 'bg-zinc-600'
                  }
                `}  
              />

              <span>
                {friend}
              </span>

            </div>
          </button>
        )
      )}

    </div>
  );
}
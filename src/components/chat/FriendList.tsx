import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setSelectedChat, setTyping } from '../../store/slices/chat.slice';

export default function FriendList() {
  const dispatch = useDispatch<AppDispatch>();

  const friends = useSelector((state: RootState) => state.friend.friends);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const chats = useSelector((state: RootState) => state.chat.chats);

  const handleClick = (friendUsername: string) => {
    // Find existing private chat with this friend
    const existingChat = chats.find(
      c => c.type === 'PRIVATE' && c.otherParticipantUsername === friendUsername
    );

    if (existingChat) {
      dispatch(setSelectedChat(existingChat));
    }

    dispatch(setTyping(friendUsername));
    setTimeout(() => dispatch(setTyping(null)), 3000);
  };

  if (friends.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">No friends yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {friends.map(friend => (
        <button
          key={friend.userId}
          onClick={() => handleClick(friend.username)}
          className="w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-medium">
                {friend.username.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${onlineUsers.includes(friend.username) ? 'bg-green-500' : 'bg-zinc-600'
                }`} />
            </div>
            <span className="text-white text-sm">{friend.username}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
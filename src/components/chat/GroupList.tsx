import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setSelectedChat } from '../../store/slices/chat.slice';
import CreateGroupModal from './CreateGroupModal';

export default function GroupList() {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);

  const chats = useSelector((state: RootState) => state.chat.chats);
  const groupChats = chats.filter(c => c.type === 'GROUP');

  return (
    <div className="border-t border-zinc-800">
      {open && <CreateGroupModal onClose={() => setOpen(false)} />}

      <div className="p-4 text-zinc-400 text-sm">Groups</div>

      <button
        onClick={() => setOpen(true)}
        className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl mb-2 mx-2 transition"
        style={{ width: 'calc(100% - 16px)' }}
      >
        + Create Group
      </button>

      {groupChats.length === 0 && (
        <p className="text-zinc-500 text-sm px-4 py-2">No groups yet.</p>
      )}

      {groupChats.map(group => (
        <button
          key={group.chatId}
          onClick={() => dispatch(setSelectedChat(group))}
          className="w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm">
              👥
            </div>
            <div>
              <p className="text-white text-sm">{group.groupInfo?.name}</p>
              <p className="text-zinc-500 text-xs">{group.groupInfo?.memberCount} members</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
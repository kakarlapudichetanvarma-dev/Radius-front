import { useState, useMemo, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchFriends } from '../../store/slices/friend.slice';
import { fetchChats } from '../../store/slices/chat.slice';
import AddFriendModal from './AddFriendModal';
import ProfileModal from './ProfileModal';
import CreateGroupModal from './CreateGroupModal';
import { Archive } from 'lucide-react';

export function dispatchOpenArchived() {
  window.dispatchEvent(new CustomEvent('open-archived-chats'));
}

const ProfileBar = memo(function ProfileBar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch  = useDispatch<AppDispatch>();

  const [showAddFriend,    setShowAddFriend]    = useState(false);
  const [showProfile,      setShowProfile]      = useState(false);
  const [showCreateGroup,  setShowCreateGroup]  = useState(false);

  const avatarSrc = useMemo(
    () => user?.profilePicture ? `http://localhost:8080${user.profilePicture}` : null,
    [user?.profilePicture]
  );

  return (
    <>
      {showAddFriend   && <AddFriendModal   onClose={() => setShowAddFriend(false)}   />}
      {showProfile     && <ProfileModal     onClose={() => setShowProfile(false)}     />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}

      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4">

        {/* Left — avatar + username */}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowProfile(true)} className="focus:outline-none">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-green-600 flex items-center justify-center text-white font-bold">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                user?.username?.charAt(0).toUpperCase() || '?'
              )}
            </div>
          </button>

          <div>
            <p className="font-semibold text-white">{user?.username || 'Unknown'}</p>
            <p className="text-xs text-zinc-400">Online</p>
          </div>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2">

          {/* Archived chats */}
          <button
            onClick={dispatchOpenArchived}
            className="text-zinc-400 hover:text-white transition"
            title="Archived Chats"
          >
            <Archive size={20} />
          </button>

          {/* New group */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="text-zinc-400 hover:text-white transition text-lg"
            title="New Group Chat"
          >
            👥
          </button>

          {/* Add friend */}
          <button
            onClick={() => setShowAddFriend(true)}
            className="text-zinc-400 hover:text-white transition text-xl"
            title="Add Friend"
          >
            👤+
          </button>
        </div>
      </div>
    </>
  );
});

export default ProfileBar;
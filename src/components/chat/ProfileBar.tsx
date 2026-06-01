import { useState, useMemo, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { respondToFriendRequest, fetchFriends, fetchPendingRequests } from '../../store/slices/friend.slice';
import { fetchChats } from '../../store/slices/chat.slice';
import AddFriendModal from './AddFriendModal';
import ProfileModal from './ProfileModal';
import CreateGroupModal from './CreateGroupModal';
import { Archive } from 'lucide-react';
export function dispatchOpenArchived() {
  window.dispatchEvent(new CustomEvent('open-archived-chats'));
}

// ✅ memo — prevents re-render during sidebar drag since ProfileBar has no drag-related props
const ProfileBar = memo(function ProfileBar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const pendingRequests = useSelector((state: RootState) => state.friend.pendingRequests);
  const dispatch = useDispatch<AppDispatch>();

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // ✅ useMemo — only recomputes when profilePicture actually changes, not on every render
  const avatarSrc = useMemo(
    () => user?.profilePicture ? `http://localhost:8080${user.profilePicture}` : null,
    [user?.profilePicture]
  );

  const handleRespond = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    await dispatch(respondToFriendRequest({ requestId, action }));
    dispatch(fetchPendingRequests());
    dispatch(fetchFriends());
    if (user?.username) dispatch(fetchChats(user.username));
  };

  return (
    <>
      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}

      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">

          {/* Avatar — clicking opens profile */}
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

        <div className="flex items-center gap-2">
          {/* 🗄️ Archived Chats */}
         <button
  onClick={dispatchOpenArchived}
  className="text-zinc-400 hover:text-white transition"
  title="Archived Chats"
>
  <Archive size={20} />
</button>

          {/* 👥 New Group Chat */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="text-zinc-400 hover:text-white transition text-lg"
            title="New Group Chat"
          >
            👥
          </button>

          {/* ➕ Add Friend */}
          <button
            onClick={() => setShowAddFriend(true)}
            className="text-zinc-400 hover:text-white transition text-xl"
            title="Add Friend"
          >
            👤+
          </button>
        </div>
      </div>

      {/* Pending Requests Dropdown */}
      {showRequests && (
        <div className="absolute top-16 right-0 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {pendingRequests.length === 0 ? (
            <p className="text-zinc-500 text-sm p-4 text-center">No pending requests</p>
          ) : (
            pendingRequests.map(request => (
              <div key={request.requestId} className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-bold">
                    {request.requesterUsername?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{request.requesterUsername}</p>
                    <p className="text-zinc-500 text-xs">{request.requesterPhone}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
});

export default ProfileBar;
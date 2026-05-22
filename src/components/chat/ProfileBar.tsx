import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { respondToFriendRequest, fetchFriends, fetchPendingRequests } from '../../store/slices/friend.slice';
import { fetchChats } from '../../store/slices/chat.slice';
import AddFriendModal from './AddFriendModal';
import ProfileModal from './ProfileModal';

export default function ProfileBar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const pendingRequests = useSelector((state: RootState) => state.friend.pendingRequests);
  const dispatch = useDispatch<AppDispatch>();

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // ✅ Read directly from Redux — updates instantly when auth.user.profilePicture changes
  const avatarSrc = user?.profilePicture
    ? `http://localhost:8080${user.profilePicture}?t=${Date.now()}`
    : null;

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddFriend(true)}
            className="text-zinc-400 hover:text-white transition text-xl"
            title="Add Friend"
          >
            ➕
          </button>

          <div className="relative">
            <button
              onClick={() => setShowRequests(prev => !prev)}
              className="text-zinc-400 hover:text-white transition text-xl"
              title="Friend Requests"
            >
              🔔
            </button>

            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowProfile(true)}
            className="text-zinc-400 hover:text-white transition"
            title="Settings / Profile"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Pending Requests Dropdown */}
      {showRequests && (
        <div className="absolute top-16 right-0 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-zinc-700 flex justify-between items-center">
            <p className="text-white font-semibold text-sm">Friend Requests</p>
            <button
              onClick={() => setShowRequests(false)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(request.requestId, 'ACCEPT')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 rounded-lg transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(request.requestId, 'REJECT')}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm py-1.5 rounded-lg transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
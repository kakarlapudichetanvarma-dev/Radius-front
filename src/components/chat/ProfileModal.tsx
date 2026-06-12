import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { updateProfile, logout } from '../../store/slices/auth.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFriends } from '../../store/slices/friend.slice';
import { fetchChats } from '../../store/slices/chat.slice';
import { updateGroupInfo } from '../../store/slices/group.slice';

interface Props {
  onClose: () => void;
  groupMode?: boolean;
  groupId?: string;
  groupName?: string;
  groupProfilePicture?: string | null;
}

export default function ProfileModal({
  onClose,
  groupMode = false,
  groupId,
  groupName,
  groupProfilePicture,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, updatingProfile, updateError } = useSelector((state: RootState) => state.auth);

  const [username, setUsername]           = useState(groupMode ? groupName || '' : user?.username || '');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const [localError, setLocalError]       = useState('');

  // ── Avatar display (no upload) ────────────────────────────────────────────
  const avatarSrc = groupMode
    ? groupProfilePicture || null
    : user?.profilePicture
      ? `http://localhost:8080${user.profilePicture}?t=${Date.now()}`
      : null;

  const displayName = groupMode ? (groupName || 'Group') : (user?.username || '?');

  const handleSave = async () => {
    setLocalError('');
    setSuccessMsg('');

    if (groupMode && groupId) {
      const result = await dispatch(updateGroupInfo({
        groupId,
        data: { name: username },
      }));
      if (updateGroupInfo.fulfilled.match(result)) {
        setSuccessMsg('Group updated successfully!');
        dispatch(fetchChats(user?.username || ''));
      } else {
        setLocalError((result.payload as string) || 'Failed to update group');
      }
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    if (newPassword) formData.append('password', newPassword);

    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      setSuccessMsg('Profile updated successfully!');
      dispatch(fetchFriends());
      dispatch(fetchChats(user?.username || ''));
    } else {
      setLocalError((result.payload as string) || 'Failed to update profile');
    }
  };

  const handleLogout = () => { dispatch(logout()); onClose(); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-900 font-semibold text-lg">
              {groupMode ? 'Group Settings' : 'Profile'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">

            {/* Avatar — display only, no upload */}
            <div className="flex flex-col items-center gap-2">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-violet-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Username / Group Name */}
            <div>
              <label className="text-gray-500 text-xs font-medium mb-1 block">
                {groupMode ? 'Group Name' : 'Username'}
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none transition"
                placeholder={groupMode ? 'Enter group name' : 'Enter username'}
              />
            </div>

            {/* User-only fields */}
            {!groupMode && (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-500 text-xs font-medium mb-1 block">Email</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-400 text-sm">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-medium mb-1 block">Phone Number</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-400 text-sm">
                      {user?.phoneNumber}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-500 text-xs font-medium mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none transition"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-medium mb-1 block">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none transition"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Messages */}
            {(localError || updateError) && (
              <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2">
                {localError || updateError}
              </p>
            )}
            {successMsg && (
              <p className="text-violet-600 text-sm text-center bg-violet-50 border border-violet-100 rounded-xl py-2">
                {successMsg}
              </p>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSave}
                disabled={updatingProfile}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition shadow-sm shadow-violet-500/30"
              >
                {updatingProfile ? 'Saving...' : groupMode ? 'Save Group' : 'Save Changes'}
              </button>

              {!groupMode && (
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-500 py-2.5 rounded-xl font-medium text-sm transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { clearMessagesLocally, setSelectedChat, updateGroupAvatar } from '../../store/slices/chat.slice';
import { chatService } from '../../services/chat.service';
import type { GroupMember } from '../../types/chat.types';
import MediaLinksFilesPage from './MediaLinksFilesPage';

interface Props {
  onClose: () => void;
}

export default function GroupChatInfoPanel({ onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector((state: RootState) => state.chat.selectedChat);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [showMedia, setShowMedia] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fullscreenAvatar, setFullscreenAvatar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupInfo = selectedChat?.groupInfo;
  const chatId = selectedChat?.chatId;
  const groupId = groupInfo?.groupId;
  const myMember = members.find(m => m.userId === currentUser?.id);
  const isAdmin = myMember?.role === 'ADMIN';

  useEffect(() => {
    if (!groupId) return;
    setMembersLoading(true);
    chatService.getGroupMembers(groupId)
      .then(res => setMembers(res.data.data || []))
      .catch(console.error)
      .finally(() => setMembersLoading(false));
  }, [groupId]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupId || !chatId) return;
    setUploadingPhoto(true);
    try {
      const res = await chatService.updateGroupPhoto(groupId, file);
      const newPhotoPath = res.data.data?.profilePicture;
      if (newPhotoPath) {
        dispatch(updateGroupAvatar({
          chatId,
          profilePicture: `http://localhost:8080${newPhotoPath}?t=${Date.now()}`,
        }));
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleClearAll = async () => {
    if (!chatId) return;
    setClearLoading(true);
    try {
      await chatService.clearChatForMe(chatId);
      dispatch(clearMessagesLocally(chatId));
      setConfirmClear(false);
    } catch (err) {
      console.error('Clear failed:', err);
    } finally {
      setClearLoading(false);
    }
  };

  const handleExitGroup = async () => {
    if (!groupId) return;
    setExitLoading(true);
    try {
      await chatService.exitGroup(groupId);
      dispatch(setSelectedChat(null));
      onClose();
    } catch (err) {
      console.error('Exit group failed:', err);
    } finally {
      setExitLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId || !chatId) return;
    setDeleteLoading(true);
    try {
      if (isAdmin) {
        await chatService.deleteGroup(groupId);
      } else {
        await chatService.clearChatForMe(chatId);
        await chatService.exitGroup(groupId);
      }
      dispatch(clearMessagesLocally(chatId));
      dispatch(setSelectedChat(null));
      onClose();
    } catch (err) {
      console.error('Delete group failed:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!groupId) return;
    try {
      await chatService.removeGroupMember(groupId, memberId);
      setMembers(prev => prev.filter(m => m.userId !== memberId));
    } catch (err) {
      console.error('Remove member failed:', err);
    }
  };

  const getMemberDisplay = (member: GroupMember): string => {
    if (member.username && member.username.trim()) return member.username;
    return `User ${member.userId.slice(0, 6)}`;
  };

  const getInitial = (member: GroupMember): string => {
    if (member.username && member.username.trim()) return member.username.charAt(0).toUpperCase();
    return '?';
  };

  if (!selectedChat) return null;

  const avatarSrc = groupInfo?.profilePicture || null;

  return (
    <>
      {/* Fullscreen avatar */}
      <AnimatePresence>
        {fullscreenAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
            onClick={() => setFullscreenAvatar(false)}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={groupInfo?.name || 'group'}
                className="max-w-sm max-h-sm w-80 h-80 object-cover rounded-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div className="w-80 h-80 rounded-full bg-yellow-500 flex items-center justify-center text-black text-8xl font-bold shadow-2xl">
                👥
              </div>
            )}
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition"
              onClick={() => setFullscreenAvatar(false)}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm clear dialog */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[9998] flex items-center justify-center p-4"
            onClick={() => setConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-gray-900 font-semibold text-base mb-2">Clear all messages?</p>
              <p className="text-gray-500 text-sm mb-5">
                This clears the chat only for you. Other members won't be affected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearLoading}
                  className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm transition disabled:opacity-50"
                >
                  {clearLoading ? 'Clearing…' : 'Clear'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm exit dialog */}
      <AnimatePresence>
        {confirmExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[9998] flex items-center justify-center p-4"
            onClick={() => setConfirmExit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-gray-900 font-semibold text-base mb-2">Exit group?</p>
              <p className="text-gray-500 text-sm mb-5">
                You will leave "{groupInfo?.name}" and won't receive new messages.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmExit(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExitGroup}
                  disabled={exitLoading}
                  className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm transition disabled:opacity-50"
                >
                  {exitLoading ? 'Leaving…' : 'Exit Group'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[9998] flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-gray-900 font-semibold text-base mb-2">
                {isAdmin ? 'Delete group for everyone?' : 'Delete group for you?'}
              </p>
              <p className="text-gray-500 text-sm mb-5">
                {isAdmin
                  ? `This will permanently delete "${groupInfo?.name}" for all members. This cannot be undone.`
                  : `This will remove "${groupInfo?.name}" only for you. Other members will still have access.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleteLoading}
                  className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm transition disabled:opacity-50"
                >
                  {deleteLoading
                    ? 'Please wait…'
                    : isAdmin
                    ? 'Delete for Everyone'
                    : 'Delete for Me'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showMedia && chatId && (
        <AnimatePresence>
          <MediaLinksFilesPage chatId={chatId} onBack={() => setShowMedia(false)} />
        </AnimatePresence>
      )}

      {/* ── Main Panel ── */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-0 z-20 bg-white flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-violet-600 transition"
          >
            ←
          </button>
          <p className="text-gray-900 font-semibold">Group Info</p>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center py-8 px-4 border-b border-gray-100">
          <div className="relative mb-4 group">
            <button onClick={() => setFullscreenAvatar(true)}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={groupInfo?.name || 'group'}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-violet-200 group-hover:ring-violet-400 transition"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center text-black text-3xl font-bold ring-2 ring-violet-200 group-hover:ring-violet-400 transition">
                  👥
                </div>
              )}
            </button>

            {/* Edit Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-violet-500 transition shadow-lg disabled:opacity-50"
              title="Change group photo"
            >
              {uploadingPhoto ? '…' : '✏️'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <p className="text-gray-900 font-semibold text-lg">{groupInfo?.name || 'Group'}</p>
          <p className="text-gray-500 text-sm mt-1">
            {groupInfo?.memberCount || 0} members
          </p>
          {groupInfo?.description && (
            <p className="text-gray-600 text-sm mt-3 text-center px-4">
              {groupInfo.description}
            </p>
          )}
        </div>

        {/* Members Section */}
        <div className="border-b border-gray-100">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider px-5 py-3">
            Members
          </p>
          {membersLoading ? (
            <p className="text-gray-500 text-sm px-5 py-3">Loading members…</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member) => {
                const displayName = getMemberDisplay(member);
                const initial = getInitial(member);
                const isMe = member.userId === currentUser?.id;
                return (
                  <div key={member.userId} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium flex-shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-sm font-medium truncate">{displayName}</p>
                        {isMe && <span className="text-gray-500 text-xs">(You)</span>}
                      </div>
                      {member.role === 'ADMIN' && (
                        <p className="text-violet-600 text-xs">Group Admin</p>
                      )}
                    </div>

                    {member.role === 'ADMIN' && (
                      <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full border border-violet-200 flex-shrink-0">
                        Admin
                      </span>
                    )}

                    {isAdmin && !isMe && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-500 hover:text-red-600 text-xs px-3 py-1 rounded transition flex-shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Media, Links & Files */}
        <button
          onClick={() => setShowMedia(true)}
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition w-full text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🖼️</span>
            <p className="text-gray-800 text-sm font-medium">Media, Links & Files</p>
          </div>
          <span className="text-violet-500 text-lg">›</span>
        </button>

        {/* Clear All Messages */}
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 hover:bg-red-50 transition w-full text-left"
        >
          <span className="text-xl">🗑️</span>
          <p className="text-red-500 text-sm font-medium">Clear All Messages</p>
        </button>

        {/* Exit Group */}
        <button
          onClick={() => setConfirmExit(true)}
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 hover:bg-red-50 transition w-full text-left"
        >
          <span className="text-xl">🚪</span>
          <p className="text-red-500 text-sm font-medium">Exit Group</p>
        </button>

        {/* Delete Group */}
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition w-full text-left"
        >
          <span className="text-xl">💣</span>
          <div>
            <p className="text-red-600 text-sm font-semibold">
              {isAdmin ? 'Delete Group for Everyone' : 'Delete Group for Me'}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {isAdmin
                ? 'Permanently removes the group for all members'
                : 'Removes the group only for you'}
            </p>
          </div>
        </button>
      </motion.div>
    </>
  );
}
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
      {fullscreenAvatar && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={() => setFullscreenAvatar(false)}>
          {avatarSrc ? (
            <img src={avatarSrc} alt={groupInfo?.name || 'group'}
              className="max-w-sm w-80 h-80 object-cover rounded-full"
              onClick={e => e.stopPropagation()} />
          ) : (
            <div className="w-80 h-80 rounded-full bg-yellow-500 flex items-center justify-center text-black text-7xl">👥</div>
          )}
          <button className="absolute top-4 right-4 text-white text-4xl hover:text-zinc-300 transition"
            onClick={() => setFullscreenAvatar(false)}>×</button>
        </div>
      )}

      {/* Confirm clear */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center p-4"
          onClick={() => setConfirmClear(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold text-base mb-2">Clear all messages?</p>
            <p className="text-zinc-400 text-sm mb-5">This clears the chat only for you. Other members won't be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClear(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={handleClearAll} disabled={clearLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm transition disabled:opacity-50">
                {clearLoading ? 'Clearing…' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm exit */}
      {confirmExit && (
        <div className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center p-4"
          onClick={() => setConfirmExit(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold text-base mb-2">Exit group?</p>
            <p className="text-zinc-400 text-sm mb-5">You will leave "{groupInfo?.name}" and won't receive new messages.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmExit(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={handleExitGroup} disabled={exitLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm transition disabled:opacity-50">
                {exitLoading ? 'Leaving…' : 'Exit Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}>
            <p className="text-white font-semibold text-base mb-2">
              {isAdmin ? 'Delete group for everyone?' : 'Delete group for you?'}
            </p>
            <p className="text-zinc-400 text-sm mb-5">
              {isAdmin
                ? `This will permanently delete "${groupInfo?.name}" for all members. This cannot be undone.`
                : `This will remove "${groupInfo?.name}" only for you. Other members will still have access.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={handleDeleteGroup} disabled={deleteLoading}
                className="flex-1 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm transition disabled:opacity-50">
                {deleteLoading ? 'Please wait…' : isAdmin ? 'Delete for Everyone' : 'Delete for Me'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMedia && chatId && (
        <AnimatePresence>
          <MediaLinksFilesPage chatId={chatId} onBack={() => setShowMedia(false)} />
        </AnimatePresence>
      )}

      {/* ── Main panel ── */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-0 z-20 bg-zinc-950"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Sticky header */}
        <div style={{ flexShrink: 0 }}
          className="h-16 bg-black border-b border-yellow-500/20 flex items-center px-4 gap-3">
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-yellow-400 transition">
            ←
          </button>
          <p className="text-yellow-400 font-semibold">Group Info</p>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

          {/* Group Profile */}
          <div className="flex flex-col items-center py-8 px-4 border-b border-zinc-800">
            <div className="relative mb-4 group">
              <button onClick={() => setFullscreenAvatar(true)}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={groupInfo?.name || 'group'}
                    className="w-24 h-24 rounded-full object-cover ring-2 ring-yellow-500/30 group-hover:ring-yellow-500 transition" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center text-black text-3xl ring-2 ring-yellow-500/30 group-hover:ring-yellow-500 transition">
                    👥
                  </div>
                )}
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs hover:bg-yellow-400 transition shadow-lg disabled:opacity-50"
                title="Change group photo">
                {uploadingPhoto ? '…' : '✏️'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <p className="text-white font-semibold text-lg">{groupInfo?.name || 'Group'}</p>
            <p className="text-zinc-500 text-sm mt-1">{groupInfo?.memberCount || 0} members</p>
            {groupInfo?.description && (
              <p className="text-zinc-400 text-sm mt-2 text-center px-4">{groupInfo.description}</p>
            )}
          </div>

          {/* Members */}
          <div className="border-b border-zinc-800">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider px-5 py-3">Members</p>
            {membersLoading ? (
              <p className="text-zinc-600 text-sm px-5 py-3">Loading members…</p>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {members.map(member => {
                  const displayName = getMemberDisplay(member);
                  const initial = getInitial(member);
                  const isMe = member.userId === currentUser?.id;
                  return (
                    <div key={member.userId} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{displayName}</p>
                          {isMe && <span className="text-zinc-500 text-xs">(You)</span>}
                        </div>
                        {member.role === 'ADMIN' && (
                          <p className="text-yellow-500 text-xs">Group Admin</p>
                        )}
                      </div>
                      {member.role === 'ADMIN' && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30 flex-shrink-0">
                          Admin
                        </span>
                      )}
                      {isAdmin && !isMe && (
                        <button onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded transition flex-shrink-0">
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
          <button onClick={() => setShowMedia(true)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition">
            <div className="flex items-center gap-3">
              <span className="text-xl">🖼️</span>
              <p className="text-white text-sm font-medium">Media, Links & Files</p>
            </div>
            <span className="text-yellow-500 text-lg">›</span>
          </button>

          {/* Clear all messages */}
          <button onClick={() => setConfirmClear(true)}
            className="w-full flex items-center gap-3 px-5 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition text-left">
            <span className="text-xl">🗑️</span>
            <p className="text-red-400 text-sm font-medium">Clear All Messages</p>
          </button>

          {/* Exit Group */}
          <button onClick={() => setConfirmExit(true)}
            className="w-full flex items-center gap-3 px-5 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition text-left">
            <span className="text-xl">🚪</span>
            <p className="text-red-500 text-sm font-medium">Exit Group</p>
          </button>

          {/* Delete Group */}
          <button onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-zinc-900 transition text-left">
            <span className="text-xl">💣</span>
            <div>
              <p className="text-red-600 text-sm font-semibold">
                {isAdmin ? 'Delete Group for Everyone' : 'Delete Group for Me'}
              </p>
              <p className="text-zinc-600 text-xs mt-0.5">
                {isAdmin
                  ? 'Permanently removes the group for all members'
                  : 'Removes the group only for you'}
              </p>
            </div>
          </button>

        </div>{/* end scrollable body */}
      </motion.div>
    </>
  );
}
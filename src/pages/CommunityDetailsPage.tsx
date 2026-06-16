import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Users, MessageCircle, Link2,
  Plus, Trash2, LogOut, UserCheck, UserX, X, Check, Send
} from 'lucide-react';

import type { AppDispatch, RootState } from '../store';
import MainLayout from '../layouts/MainLayout';
import InviteLinkModal from '../components/community/InviteLinkModal';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';

import {
  useCommunityDetailsQuery,
  useCommunityGroupsQuery,
  useCommunityMembersQuery,
} from '../queries/community.query';

import {
  useCreateGroupInCommunity,
  useDeleteCommunity,
  useLeaveCommunity,
  useRemoveCommunityMember,
  usePendingJoinRequests,
  useReviewJoinRequest,
} from '../hooks/useCommunity';

import { setSelectedChat } from '../store/slices/chat.slice';
import {
  clearCommunityGroupUnread,
  registerCommunityGroups,
} from '../store/slices/community.slice';
import { revokePreview, type PreparedUpload } from '../services/upload.service';
import type { CommunityMemberResponse, CommunityGroupSummary } from '../types/community.types';

// ── Create Group Modal ────────────────────────────────────────────────────────
function CreateGroupModal({
  communityId,
  members,
  onClose,
}: {
  communityId: string;
  members: CommunityMemberResponse[];
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const createGroup = useCreateGroupInCommunity(communityId);

  const toggle = (userId: string) =>
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createGroup.mutateAsync({ name: name.trim(), memberIds: selectedIds });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create Group</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <label className="text-xs font-medium text-gray-500 block mb-1">Group Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter group name"
          className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2
                     focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-gray-900
                     placeholder-gray-400 outline-none transition mb-4"
        />

        {members.length > 0 && (
          <>
            <label className="text-xs font-medium text-gray-500 block mb-2">Add Members</label>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {members.map(m => (
                <button
                  key={m.userId}
                  onClick={() => toggle(m.userId)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition text-left ${
                    selectedIds.includes(m.userId)
                      ? 'border-violet-400 bg-violet-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{m.name}</span>
                  {selectedIds.includes(m.userId) && (
                    <Check size={14} className="ml-auto text-violet-600" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {createGroup.isError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl py-2 text-center mb-3">
            Failed to create group. Try again.
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={!name.trim() || createGroup.isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition"
        >
          {createGroup.isPending ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunityDetailsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { communityId } = useParams<{ communityId: string }>();

  const currentUserId  = useSelector((s: RootState) => s.auth.user?.id ?? '');
  const selectedChatId = useSelector((s: RootState) => s.chat.selectedChatId);

  // Unread counts for community group chats
  const communityGroupUnread = useSelector(
    (s: RootState) => s.community.communityGroupUnread
  );

  const [showInviteModal,  setShowInviteModal]  = useState(false);
  const [showCreateGroup,  setShowCreateGroup]  = useState(false);
  const [activeTab,        setActiveTab]        = useState<'groups' | 'members' | 'requests'>('groups');
  const [openedGroupId,    setOpenedGroupId]    = useState<string | null>(null);
  const [pendingUpload,    setPendingUpload]    = useState<PreparedUpload | null>(null);

  const handleSetPendingUpload = (upload: PreparedUpload | null) => {
    if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
    setPendingUpload(upload);
  };

  const { data: community,   isLoading: loadingCommunity, isError: communityError } =
    useCommunityDetailsQuery(communityId ?? '');
  const { data: groups = [], isLoading: loadingGroups } =
    useCommunityGroupsQuery(communityId ?? '');
  const { data: membersData, isLoading: loadingMembers } =
    useCommunityMembersQuery(communityId ?? '');

  const members         = membersData?.members ?? [];
  const currentUserRole = membersData?.currentUserRole;
  const isAdmin         = currentUserRole === 'ADMIN';

  const { data: joinRequests = [] } = usePendingJoinRequests(isAdmin ? communityId ?? '' : '');

  const deleteCommunity = useDeleteCommunity();
  const leaveCommunity  = useLeaveCommunity();
  const removeMember    = useRemoveCommunityMember(communityId ?? '');
  const reviewRequest   = useReviewJoinRequest(communityId ?? '');

  // ── Register chatId → communityId mappings whenever groups load ──────────
  // This is what allows incrementCommunityGroupUnread (in message.events.ts)
  // to know which community to roll the count up to, which then shows the
  // total unread badge on the community card in the community list.
  useEffect(() => {
    if (communityId && groups.length > 0) {
      dispatch(
        registerCommunityGroups({
          communityId,
          groups: groups.map(g => ({ chatId: g.chatId })),
        })
      );
    }
  }, [communityId, groups, dispatch]);

  // Toggle group open/close — clicking the same group again closes it
  const openGroup = (group: CommunityGroupSummary) => {
    if (openedGroupId === group.groupId) {
      handleBackFromGroup();
      return;
    }
    // Clear unread for this community group chat when opening it
    dispatch(clearCommunityGroupUnread(group.chatId));
    setOpenedGroupId(group.groupId);
    dispatch(setSelectedChat({
      chatId: group.chatId,
      type: 'GROUP',
      lastMessage: null,
      lastMessageAt: null,
      archived: false,
      unreadCount: 0,
      otherParticipantUsername: null,
      otherParticipantAvatar: null,
      lastMessageStatus: null,
      lastMessageSenderId: null,
      groupInfo: {
        groupId:        group.groupId,
        name:           group.groupName,
        description:    null,
        profilePicture: group.groupPhotoUrl,
        memberCount:    group.memberCount,
        creatorId:      '',
        createdAt:      '',
      },
    }));
  };

  // Close group chat, stay on community page
  const handleBackFromGroup = () => {
    setOpenedGroupId(null);
    dispatch(setSelectedChat(null));
  };

  const handleDeleteCommunity = async () => {
    if (!communityId) return;
    if (!window.confirm('Delete this community? This cannot be undone.')) return;
    await deleteCommunity.mutateAsync(communityId);
    navigate('/communities');
  };

  const handleLeave = async () => {
    if (!communityId) return;
    if (!window.confirm('Leave this community?')) return;
    await leaveCommunity.mutateAsync(communityId);
    navigate('/communities');
  };

  if (loadingCommunity) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (communityError || !community) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-red-500 font-medium">Failed to load community</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-3 text-violet-600 text-sm underline"
            >
              Go back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Group chat view ───────────────────────────────────────────────────────
  if (openedGroupId && selectedChatId) {
    const openedGroup = groups.find(g => g.groupId === openedGroupId);

    return (
      <MainLayout>
        <>
          <div className="flex h-full overflow-hidden">

            {/* Left: groups mini-sidebar */}
            <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
              {/* Back to community detail */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <button
                  onClick={handleBackFromGroup}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                  title="Back to community"
                >
                  <ArrowLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {community.name}
                </span>
              </div>

              {/* Group list — with unread badges */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {groups.map(group => {
                  const unread = communityGroupUnread[group.chatId] || 0;
                  return (
                    <button
                      key={group.groupId}
                      onClick={() => openGroup(group)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        group.groupId === openedGroupId
                          ? 'bg-violet-50 border border-violet-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {group.groupName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          group.groupId === openedGroupId ? 'text-violet-700' : 'text-gray-800'
                        }`}>
                          {group.groupName}
                        </p>
                        <p className="text-xs text-gray-400">{group.memberCount} members</p>
                      </div>
                      {unread > 0 && (
                        <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </button>
                  );
                })}

                {isAdmin && (
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-violet-300 hover:bg-violet-50 transition text-left mt-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Plus size={16} className="text-violet-600" />
                    </div>
                    <span className="text-sm text-violet-600 font-medium">New Group</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: chat window */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
                <button
                  onClick={handleBackFromGroup}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                  title="Close chat"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {openedGroup?.groupName.charAt(0).toUpperCase() ?? '#'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{openedGroup?.groupName}</p>
                  <p className="text-xs text-gray-400">{openedGroup?.memberCount} members</p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatWindow onFilePrepared={handleSetPendingUpload} />
              </div>
              <MessageInput
                pendingUpload={pendingUpload}
                setPendingUpload={handleSetPendingUpload}
              />
            </div>
          </div>

          {showCreateGroup && communityId && (
            <CreateGroupModal
              communityId={communityId}
              members={members.filter(m => m.userId !== currentUserId)}
              onClose={() => setShowCreateGroup(false)}
            />
          )}
        </>
      </MainLayout>
    );
  }

  // ── Community detail view ─────────────────────────────────────────────────
  return (
    <MainLayout>
      <>
        {showInviteModal && communityId && (
          <InviteLinkModal
            communityId={communityId}
            onClose={() => setShowInviteModal(false)}
          />
        )}

        {showCreateGroup && communityId && (
          <CreateGroupModal
            communityId={communityId}
            members={members.filter(m => m.userId !== currentUserId)}
            onClose={() => setShowCreateGroup(false)}
          />
        )}

        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">

          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{community.name}</h1>
                <p className="text-xs text-gray-400">{community.description || 'No description'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm transition"
              >
                <Link2 size={16} /> Invite
              </button>

              {isAdmin ? (
                <button
                  onClick={handleDeleteCommunity}
                  title="Delete community"
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                <button
                  onClick={handleLeave}
                  title="Leave community"
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-6 text-sm text-gray-500 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {community.memberCount} members
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={14} /> {community.groupCount} groups
            </span>
            {isAdmin && joinRequests.length > 0 && (
              <span className="flex items-center gap-1.5 text-violet-600 font-medium">
                {joinRequests.length} pending request{joinRequests.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 flex gap-1 flex-shrink-0">
            {(['groups', 'members', ...(isAdmin ? ['requests'] : [])] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition capitalize ${
                  activeTab === tab
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'requests' && joinRequests.length > 0 && (
                  <span className="ml-1.5 bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5">
                    {joinRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Groups */}
            {activeTab === 'groups' && (
              <div className="space-y-3">
                {loadingGroups ? (
                  <div className="text-center text-gray-400 text-sm py-8">Loading groups...</div>
                ) : groups.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                    <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-medium text-gray-700">No groups yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Create the first group for this community
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="mt-4 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition"
                      >
                        Create Group
                      </button>
                    )}
                  </div>
                ) : (
                  groups.map(group => {
                    const unread = communityGroupUnread[group.chatId] || 0;
                    return (
                      <button
                        key={group.groupId}
                        onClick={() => openGroup(group)}
                        className="w-full bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all p-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {group.groupName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{group.groupName}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{group.memberCount} members</p>
                          </div>
                          {unread > 0 ? (
                            <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                              {unread > 99 ? '99+' : unread}
                            </span>
                          ) : (
                            <Send size={16} className="text-gray-300" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Members */}
            {activeTab === 'members' && (
              <div className="space-y-2">
                {loadingMembers ? (
                  <div className="text-center text-gray-400 text-sm py-8">Loading members...</div>
                ) : members.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">No members found</div>
                ) : (
                  members.map(member => (
                    <div
                      key={member.userId}
                      className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          {member.role === 'ADMIN' ? '👑 Admin' : 'Member'}
                        </p>
                      </div>
                      {isAdmin && member.userId !== currentUserId && (
                        <button
                          onClick={() => removeMember.mutate(member.userId)}
                          title="Remove member"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Join Requests */}
            {activeTab === 'requests' && isAdmin && (
              <div className="space-y-2">
                {joinRequests.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No pending join requests
                  </div>
                ) : (
                  joinRequests.map(req => (
                    <div
                      key={req.id}
                      className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                        {req.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{req.userName}</p>
                        <p className="text-xs text-gray-400">
                          Requested {new Date(req.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => reviewRequest.mutate({ requestId: req.id, accept: true })}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                        >
                          <UserCheck size={16} />
                        </button>
                        <button
                          onClick={() => reviewRequest.mutate({ requestId: req.id, accept: false })}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* FAB */}
          {activeTab === 'groups' && isAdmin && (
            <button
              onClick={() => setShowCreateGroup(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center transition z-40"
              title="Create group"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </>
    </MainLayout>
  );
}
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Users, MessageCircle, Link2,
  Plus, Trash2, LogOut, UserCheck, UserX, X, Check
} from 'lucide-react';

import type { AppDispatch, RootState } from '../store';
import MainLayout from '../layouts/MainLayout';
import InviteLinkModal from '../components/community/InviteLinkModal';

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
          <h2 className="text-lg font-semibold">Create Group</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <label className="text-xs font-medium text-gray-500 block mb-1">Group Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter group name"
          className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none transition mb-4"
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

  const currentUserId = useSelector((s: RootState) => s.auth.user?.id ?? '');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'members' | 'requests'>('groups');

  const { data: community, isLoading: loadingCommunity, isError: communityError } =
    useCommunityDetailsQuery(communityId ?? '');

  const { data: groups = [], isLoading: loadingGroups } =
    useCommunityGroupsQuery(communityId ?? '');

  const { data: membersData, isLoading: loadingMembers } =
    useCommunityMembersQuery(communityId ?? '');

  const members = membersData?.members ?? [];
  const currentUserRole = membersData?.currentUserRole;
  const isAdmin = currentUserRole === 'ADMIN';

  const { data: joinRequests = [] } = usePendingJoinRequests(isAdmin ? communityId ?? '' : '');

  const deleteCommunity = useDeleteCommunity();
  const leaveCommunity = useLeaveCommunity();
  const removeMember = useRemoveCommunityMember(communityId ?? '');
  const reviewRequest = useReviewJoinRequest(communityId ?? '');

  const openGroup = (group: CommunityGroupSummary) => {
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
        groupId: group.groupId,
        name: group.groupName,
        description: null,
        profilePicture: group.groupPhotoUrl,
        memberCount: group.memberCount,
        creatorId: '',
        createdAt: '',
      },
    }));
    navigate('/chat');
  };

  const handleDeleteCommunity = async () => {
    if (!communityId) return;
    if (!window.confirm('Delete this community? This cannot be undone.')) return;
    await deleteCommunity.mutateAsync(communityId);
    navigate('/chat'); // ← changed from '/communities'
  };

  const handleLeave = async () => {
    if (!communityId) return;
    if (!window.confirm('Leave this community?')) return;
    await leaveCommunity.mutateAsync(communityId);
    navigate('/chat'); // ← changed from '/communities'
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
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-500 font-medium">Failed to load community</p>
            <button onClick={() => navigate('/chat')} className="mt-3 text-violet-600 text-sm underline"> {/* ← changed from '/communities' */}
              Go back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <>
        {showInviteModal && communityId && (
          <InviteLinkModal communityId={communityId} onClose={() => setShowInviteModal(false)} />
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
              <button onClick={() => navigate('/chat')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"> {/* ← changed from '/communities' */}
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

          {/* Stats Bar */}
          <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-6 text-sm text-gray-500 flex-shrink-0">
            <span className="flex items-center gap-1.5"><Users size={14} /> {community.memberCount} members</span>
            <span className="flex items-center gap-1.5"><MessageCircle size={14} /> {community.groupCount} groups</span>
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

            {/* ── Groups Tab ── */}
            {activeTab === 'groups' && (
              <div className="space-y-3">
                {loadingGroups ? (
                  <div className="text-center text-gray-400 text-sm py-8">Loading groups...</div>
                ) : groups.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                    <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-medium text-gray-700">No groups yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create the first group for this community</p>
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="mt-4 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition"
                    >
                      Create Group
                    </button>
                  </div>
                ) : (
                  <>
                    {groups.map(group => (
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
                          <MessageCircle size={16} className="text-gray-300" />
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── Members Tab ── */}
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
                        <p className="text-xs text-gray-400">{member.role === 'ADMIN' ? '👑 Admin' : 'Member'}</p>
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

            {/* ── Join Requests Tab (admin only) ── */}
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
                          title="Accept"
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                        >
                          <UserCheck size={16} />
                        </button>
                        <button
                          onClick={() => reviewRequest.mutate({ requestId: req.id, accept: false })}
                          title="Reject"
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

          {/* FAB — create group */}
          {activeTab === 'groups' && (
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
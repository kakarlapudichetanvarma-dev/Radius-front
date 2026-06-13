// src/components/community/CommunityMembersPanel.tsx
import { useCommunityMembersQuery } from '../../queries/community.query';
import {
  useRemoveCommunityMember,
  useLeaveCommunity
} from '../../hooks/useCommunity';
import { Shield, UserMinus, LogOut } from 'lucide-react';

interface CommunityMembersPanelProps {
  communityId: string;
  currentUserId: string;
  onLeft?: () => void;
}

export default function CommunityMembersPanel({
  communityId,
  currentUserId,
  onLeft
}: CommunityMembersPanelProps) {
  const { data, isLoading } = useCommunityMembersQuery(communityId);
  const removeMember = useRemoveCommunityMember(communityId);
  const leaveCommunity = useLeaveCommunity();

  if (isLoading || !data) {
    return <div className="text-center py-8 text-gray-400 text-sm">Loading members...</div>;
  }

  const isAdmin = data.currentUserRole === 'ADMIN';

  const handleLeave = async () => {
    await leaveCommunity.mutateAsync(communityId);
    onLeft?.();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Members ({data.members.length})
        </h3>
        {isAdmin && (
          <span className="text-xs text-violet-600 font-medium flex items-center gap-1">
            <Shield size={14} /> You're an admin
          </span>
        )}
      </div>

      {data.members.map(member => (
        <div
          key={member.id}
          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              {member.role === 'ADMIN' && (
                <p className="text-xs text-violet-600">Admin</p>
              )}
            </div>
          </div>

          {isAdmin && member.userId !== currentUserId && (
            <button
              onClick={() => removeMember.mutate(member.userId)}
              className="text-gray-400 hover:text-red-500 transition"
              title="Remove member"
            >
              <UserMinus size={18} />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={handleLeave}
        disabled={leaveCommunity.isPending}
        className="w-full flex items-center justify-center gap-2 mt-4 text-red-500 hover:bg-red-50 border border-red-100 py-2.5 rounded-xl text-sm font-medium transition"
      >
        <LogOut size={16} />
        {leaveCommunity.isPending ? 'Leaving...' : 'Leave Community'}
      </button>

      {leaveCommunity.isError && (
        <p className="text-red-500 text-xs text-center mt-2">
          {(leaveCommunity.error as any)?.response?.data?.message ||
            'Could not leave community.'}
        </p>
      )}
    </div>
  );
}
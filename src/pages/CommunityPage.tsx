import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useCommunityQuery } from '../queries/community.query';
import { communityService } from '../services/community.service';
import { registerCommunityGroups } from '../store/slices/community.slice';
import type { AppDispatch } from '../store';
import CommunityList from '../components/community/CommunityList';
import CommunityEmptyState from '../components/community/CommunityEmptyState';
import CreateCommunityModal from '../components/community/CreateCommunityModal';
import JoinCommunityModal from '../components/community/JoinCommunityModal';

export default function CommunityPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data: communities, isLoading } = useCommunityQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // ── Register ALL community groups as soon as the community list loads ─────
  // This ensures chatIdToCommunityId is populated for every community upfront,
  // so incoming WebSocket messages can be attributed to the correct community
  // even if the user has never clicked into that community's detail page.
  useEffect(() => {
    if (!communities || communities.length === 0) return;

    communities.forEach(async (community) => {
      try {
        const res = await communityService.getCommunityGroups(community.id);
        const groups = res.data;
        if (groups && groups.length > 0) {
          dispatch(
            registerCommunityGroups({
              communityId: community.id,
              groups: groups.map(g => ({ chatId: g.chatId })),
            })
          );
        }
      } catch {
        // silently ignore — badges just won't show for this community
      }
    });
  }, [communities, dispatch]);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>;
  }

  const hasCommunities = communities && communities.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header with back arrow */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => navigate('/chat')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title="Back to chats"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-gray-900">Communities</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {hasCommunities ? (
          <>
            <CommunityList
              communities={communities}
              onCommunityClick={id => navigate(`/communities/${id}`)}
            />
            {/* Always show create/join buttons so users can create multiple communities */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCreate(true)}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition"
              >
                + Create Community
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="flex-1 py-2.5 border border-violet-300 text-violet-600 hover:bg-violet-50 rounded-xl text-sm font-medium transition"
              >
                Join Community
              </button>
            </div>
          </>
        ) : (
          <CommunityEmptyState
            onCreateClick={() => setShowCreate(true)}
            onJoinClick={() => setShowJoin(true)}
          />
        )}
      </div>

      {showCreate && (
        <CreateCommunityModal
          onClose={() => setShowCreate(false)}
          onCreated={id => navigate(`/communities/${id}`)}
        />
      )}

      {showJoin && (
        <JoinCommunityModal
          onClose={() => setShowJoin(false)}
          onJoined={id => navigate(`/communities/${id}`)}
        />
      )}
    </div>
  );
}
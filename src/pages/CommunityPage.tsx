import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityQuery } from '../queries/community.query';
import CommunityList from '../components/community/CommunityList';
import CommunityEmptyState from '../components/community/CommunityEmptyState';
import CreateCommunityModal from '../components/community/CreateCommunityModal';
import JoinCommunityModal from '../components/community/JoinCommunityModal';

export default function CommunityPage() {
  const navigate = useNavigate();
  const { data: communities, isLoading } = useCommunityQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>;
  }

  const hasCommunities = communities && communities.length > 0;

  return (
    <div className="p-4">
      {hasCommunities ? (
        <CommunityList
          communities={communities}
          onCommunityClick={id => navigate(`/communities/${id}`)}
        />
      ) : (
        <CommunityEmptyState
          onCreateClick={() => setShowCreate(true)}
          onJoinClick={() => setShowJoin(true)}
        />
      )}

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
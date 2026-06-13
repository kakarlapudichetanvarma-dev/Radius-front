import CommunityCard from './CommunityCard';
import type { Community } from '../../types/community.types';

interface CommunityListProps {
  communities: Community[];
  onCommunityClick: (communityId: string) => void;
}

export default function CommunityList({
  communities,
  onCommunityClick
}: CommunityListProps) {
  if (communities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">
          No communities yet
        </p>

        <p className="mt-2 text-sm">
          Communities you join will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {communities.map(community => (
        <CommunityCard
          key={community.id}
          community={community}
          onClick={() =>
            onCommunityClick(community.id)
          }
        />
      ))}
    </div>
  );
}
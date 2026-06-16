import { memo } from 'react';
import { useSelector } from 'react-redux';
import { Users, MessageCircle } from 'lucide-react';
import type { RootState } from '../../store';
import type { Community } from '../../types/community.types';

interface CommunityCardProps {
  community: Community;
  onClick: () => void;
}

const CommunityCard = memo(function CommunityCard({
  community,
  onClick
}: CommunityCardProps) {
  // Total unread count for this community (sum of all its groups)
  const unread = useSelector(
    (s: RootState) => s.community.communityUnread[community.id] || 0
  );

  return (
    <button
      onClick={onClick}
      className="
        w-full
        bg-white
        rounded-xl
        border border-gray-200
        hover:border-violet-300
        hover:shadow-md
        transition-all
        p-4
        text-left
      "
    >
      <div className="flex gap-4 items-start">

        <div
          className="
            w-14 h-14
            rounded-xl
            overflow-hidden
            bg-violet-600
            flex items-center justify-center
            text-white
            font-bold
            text-lg
            flex-shrink-0
          "
        >
          {community.photoUrl ? (
            <img
              src={`http://localhost:8080${community.photoUrl}`}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            community.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {community.name}
            </h3>
            {/* Unread badge — total across all groups in this community */}
            {unread > 0 && (
              <span className="flex-shrink-0 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {community.description || 'No description'}
          </p>

          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users size={16} />
              {community.memberCount}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={16} />
              {community.groupCount}
            </div>
          </div>

        </div>

      </div>
    </button>
  );
});

export default CommunityCard;
import { Users, Plus, Link2 } from 'lucide-react';

interface CommunityEmptyStateProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export default function CommunityEmptyState({
  onCreateClick,
  onJoinClick
}: CommunityEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
        <Users size={28} className="text-violet-600" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        You're not in any community yet
      </h2>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">
        Create your own community or join one using an invite link.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xs">
        <button
          onClick={onCreateClick}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} />
          Create Community
        </button>

        <button
          onClick={onJoinClick}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Link2 size={16} />
          Join Community
        </button>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Users, X } from 'lucide-react';
import { useCreateCommunity } from '../../hooks/useCommunity';

interface CreateCommunityModalProps {
  onClose: () => void;
  onCreated?: (communityId: string) => void;
}

export default function CreateCommunityModal({
  onClose,
  onCreated
}: CreateCommunityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createCommunity = useCreateCommunity();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const result = await createCommunity.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined
    });

    onCreated?.(result.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={22} className="text-violet-600" />
            <h2 className="text-lg font-semibold">Create Community</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-500 text-xs font-medium mb-1 block">
              Community Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter community name"
              className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="text-gray-500 text-xs font-medium mb-1 block">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this community about?"
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none"
            />
          </div>

          {createCommunity.isError && (
            <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2">
              Failed to create community. Please try again.
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || createCommunity.isPending}
          className="mt-5 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition shadow-sm shadow-violet-500/30"
        >
          {createCommunity.isPending ? 'Creating...' : 'Create Community'}
        </button>
      </div>
    </div>
  );
}
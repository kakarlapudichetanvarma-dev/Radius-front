import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { createGroup } from '../../store/slices/group.slice';
import { fetchChats } from '../../store/slices/chat.slice';

interface Props {
  onClose: () => void;
}

export default function CreateGroupModal({ onClose }: Props) {

  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  const friends = useSelector(
    (state: RootState) => state.friend.friends
  );

  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const toggleMember = (userId: string) => {

    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {

    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    if (selectedIds.length < 1) {
      setError('Add at least one friend.');
      return;
    }

    setLoading(true);

    setError(null);

    const result = await dispatch(
      createGroup({
        name,
        memberIds: selectedIds,
        profilePicture,
      })
    );

    if (createGroup.fulfilled.match(result)) {

      if (user?.username) {
        dispatch(fetchChats(user.username));
      }

      onClose();

    } else {

      setError(
        result.payload as string ||
        'Failed to create group.'
      );
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md space-y-4">

        <h2 className="text-xl font-bold text-white">
          Create Group
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Group image */}
        <div className="flex flex-col items-center gap-3">

          <label className="cursor-pointer">

            <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">

              {profilePicture ? (

                <img
                  src={profilePicture}
                  alt="Group"
                  className="w-full h-full object-cover"
                />

              ) : (

                <span className="text-3xl text-zinc-500">
                  👥
                </span>

              )}

            </div>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />

          </label>

          <p className="text-zinc-400 text-xs">
            Tap to choose group photo
          </p>

        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Group name"
          className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none focus:ring-2 focus:ring-green-500"
        />

        <div>

          <p className="text-zinc-400 text-sm mb-2">
            Select friends to add:
          </p>

          <div className="max-h-48 overflow-y-auto space-y-2">

            {friends.length === 0 && (
              <p className="text-zinc-500 text-sm">
                No friends yet. Add friends first.
              </p>
            )}

            {friends.map(friend => (

              <button
                key={friend.userId}
                onClick={() => toggleMember(friend.userId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                  selectedIds.includes(friend.userId)
                    ? 'bg-green-600/20 border border-green-600'
                    : 'bg-zinc-800 border border-transparent'
                }`}
              >

                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-white text-sm font-bold">

                  {friend.profilePicture ? (

                    <img
                      src={`http://localhost:8080${friend.profilePicture}`}
                      alt={friend.username}
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    friend.username.charAt(0).toUpperCase()

                  )}

                </div>

                <span className="text-white text-sm">
                  {friend.username}
                </span>

                {selectedIds.includes(friend.userId) && (
                  <span className="ml-auto text-green-400">
                    ✓
                  </span>
                )}

              </button>
            ))}

          </div>

        </div>

        {selectedIds.length > 0 && (
          <p className="text-zinc-400 text-xs">
            {selectedIds.length} friend(s) selected
          </p>
        )}

        <div className="flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white p-3 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>

        </div>

      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { searchByPhone, addFriendDirectly, fetchFriends, clearPhoneSearch } from '../../store/slices/friend.slice';
import { fetchChats, setSelectedChat } from '../../store/slices/chat.slice';

const schema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number (e.g. +919985475365)')
});
type FormData = z.infer<typeof schema>;

interface Props { onClose: () => void; }

export default function AddFriendModal({ onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { phoneSearchResult, phoneSearchLoading, phoneSearchError } = useSelector((state: RootState) => state.friend);
  const { user } = useSelector((state: RootState) => state.auth);

  const { register, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const phoneValue = watch('phoneNumber');

  useEffect(() => {
    if (!phoneValue || phoneValue.length < 10) { dispatch(clearPhoneSearch()); return; }
    const normalized = phoneValue.startsWith('+') ? phoneValue : `+${phoneValue}`;
    const timeout = setTimeout(() => { dispatch(searchByPhone(normalized)); }, 500);
    return () => clearTimeout(timeout);
  }, [phoneValue, dispatch]);

  const handleAddFriend = async () => {
    if (!phoneSearchResult) return;
    setLoading(true);
    setApiError(null);
    try {
      const result = await dispatch(addFriendDirectly(phoneSearchResult.phoneNumber));
      if (addFriendDirectly.fulfilled.match(result)) {
        await dispatch(fetchFriends());
        if (user?.username) await dispatch(fetchChats(user.username));
        dispatch(clearPhoneSearch());

        const { store } = await import('../../store');
        const freshChats = store.getState().chat.chats;
        const existingChat = freshChats.find(
          (c: any) => c.type === 'PRIVATE' && c.otherParticipantUsername === phoneSearchResult.username
        );

        if (existingChat) {
          dispatch(setSelectedChat(existingChat));
        } else {
          dispatch(setSelectedChat({
            chatId: `temp-${phoneSearchResult.username}`,
            type: 'PRIVATE',
            otherParticipantUsername: phoneSearchResult.username,
            otherParticipantAvatar: phoneSearchResult.profilePicture || null,
            lastMessage: null,
            lastMessageAt: null,
            lastMessageStatus: null,
            lastMessageSenderId: null,
            archived: false,
            unreadCount: 0,
            groupInfo: null,
          }));
        }
        onClose();
      } else {
        setApiError(result.payload as string || 'Failed to add friend.');
      }
    } catch {
      setApiError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-4 border border-gray-100">

        <h2 className="text-2xl font-bold text-gray-900">Add Friend</h2>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{apiError}</div>
        )}
        {phoneSearchError && phoneValue?.length >= 10 && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{phoneSearchError}</div>
        )}

        <div>
          <input
            {...register('phoneNumber')}
            placeholder="Phone number (e.g. +919985475365)"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition placeholder-gray-400 text-sm"
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {phoneSearchLoading && <p className="text-gray-400 text-sm">Searching user...</p>}

        {phoneSearchResult && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-violet-600 flex items-center justify-center text-white font-bold">
                {phoneSearchResult.profilePicture ? (
                  <img src={`http://localhost:8080${phoneSearchResult.profilePicture}`} alt={phoneSearchResult.username} className="w-full h-full object-cover" />
                ) : (
                  phoneSearchResult.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-gray-900 font-semibold">{phoneSearchResult.username}</p>
                <p className="text-gray-500 text-sm">{phoneSearchResult.phoneNumber}</p>
              </div>
            </div>
            <button
              onClick={handleAddFriend}
              disabled={loading || phoneSearchResult.alreadyFriend}
              className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition"
            >
              {phoneSearchResult.alreadyFriend ? 'Already Added' : loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => { dispatch(clearPhoneSearch()); onClose(); }}
          className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-xl text-gray-700 font-medium text-sm transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
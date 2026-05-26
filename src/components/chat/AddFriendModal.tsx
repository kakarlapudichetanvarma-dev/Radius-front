import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../store';

import {
  searchByPhone,
  addFriendDirectly,
  fetchFriends,
  clearPhoneSearch,
} from '../../store/slices/friend.slice';

import {
  fetchChats,
  setSelectedChat,
} from '../../store/slices/chat.slice';

const schema = z.object({
  phoneNumber: z.string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      'Enter a valid phone number (e.g. +919985475365)'
    )
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

export default function AddFriendModal({ onClose }: Props) {

  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    phoneSearchResult,
    phoneSearchLoading,
    phoneSearchError,
  } = useSelector((state: RootState) => state.friend);

  const { user } = useSelector((state: RootState) => state.auth);

  const chats = useSelector((state: RootState) => state.chat.chats);

  const {
    register,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const phoneValue = watch('phoneNumber');

  // Auto search while typing
  useEffect(() => {
    if (!phoneValue || phoneValue.length < 10) {
      dispatch(clearPhoneSearch());
      return;
    }

    const normalizedPhone = phoneValue.startsWith('+') ? phoneValue : `+${phoneValue}`;

    const timeout = setTimeout(() => {
      dispatch(searchByPhone(normalizedPhone));
    }, 500);

    return () => clearTimeout(timeout);
  }, [phoneValue, dispatch]);

  const handleAddFriend = async () => {
    if (!phoneSearchResult) return;

    setLoading(true);
    setApiError(null);

    try {
      const result = await dispatch(addFriendDirectly(phoneSearchResult.phoneNumber));

      if (addFriendDirectly.fulfilled.match(result)) {
        // ✅ Refresh friends and chats
        await dispatch(fetchFriends());

        if (user?.username) {
          await dispatch(fetchChats(user.username));
        }

        dispatch(clearPhoneSearch());

        // ✅ Re-read chats from store AFTER fetchChats completes (local state is stale)
        const { store } = await import('../../store');
        const freshChats = store.getState().chat.chats;
        const existingChat = freshChats.find(
          (c: any) => c.type === 'PRIVATE' && c.otherParticipantUsername === phoneSearchResult.username
        );

        if (existingChat) {
          // Chat already exists — open it directly
          dispatch(setSelectedChat(existingChat));
        } else {
          // Chat will be created on first message — open a temp chat
          dispatch(setSelectedChat({
            chatId: `temp-${phoneSearchResult.username}`,
            type: 'PRIVATE',
            otherParticipantUsername: phoneSearchResult.username,
            otherParticipantAvatar: phoneSearchResult.profilePicture || null,
            lastMessage: null,
            lastMessageAt: null,
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-xl space-y-4 w-full max-w-md">

        <h2 className="text-2xl font-bold text-white">Add Friend</h2>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
            {apiError}
          </div>
        )}

        {phoneSearchError && phoneValue?.length >= 10 && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
            {phoneSearchError}
          </div>
        )}

        <div>
          <input
            {...register('phoneNumber')}
            placeholder="Phone number (e.g. +919985475365)"
            className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        {phoneSearchLoading && (
          <div className="text-zinc-400 text-sm">Searching user...</div>
        )}

        {phoneSearchResult && (
          <div className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-green-600 flex items-center justify-center text-white font-bold">
                {phoneSearchResult.profilePicture ? (
                  <img
                    src={`http://localhost:8080${phoneSearchResult.profilePicture}`}
                    alt={phoneSearchResult.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  phoneSearchResult.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{phoneSearchResult.username}</p>
                <p className="text-zinc-400 text-sm">{phoneSearchResult.phoneNumber}</p>
              </div>
            </div>

            <button
              onClick={handleAddFriend}
              disabled={loading || phoneSearchResult.alreadyFriend}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
            >
              {phoneSearchResult.alreadyFriend
                ? 'Already Added'
                : loading
                ? 'Adding...'
                : 'Add'
              }
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => { dispatch(clearPhoneSearch()); onClose(); }}
          className="w-full bg-zinc-700 hover:bg-zinc-600 p-3 rounded-xl text-white"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}
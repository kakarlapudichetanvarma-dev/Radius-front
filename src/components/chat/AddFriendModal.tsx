import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { sendFriendRequest } from '../../store/slices/friend.slice';

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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setApiError(null);
    try {
      // Ensure + prefix
      const phoneNumber = data.phoneNumber.startsWith('+')
        ? data.phoneNumber
        : `+${data.phoneNumber}`;

      const result = await dispatch(sendFriendRequest(phoneNumber));

      if (sendFriendRequest.fulfilled.match(result)) {
        alert('Friend request sent successfully!');
        onClose();
      } else {
        setApiError(result.payload as string || 'Failed to send friend request.');
      }
    } catch (err) {
      setApiError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-zinc-900 p-8 rounded-xl space-y-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white">Add Friend</h2>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
            {apiError}
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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 p-3 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
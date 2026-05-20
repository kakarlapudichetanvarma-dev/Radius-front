import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { respondToFriendRequest } from '../../store/slices/friend.slice';

export default function FriendRequests() {
  const dispatch = useDispatch<AppDispatch>();

  const requests = useSelector(
    (state: RootState) => state.friend.pendingRequests
  );

  return (
    <div className="border-b border-zinc-800">
      {requests.length === 0 && (
        <p className="text-zinc-500 text-sm p-4">No pending requests.</p>
      )}

      {requests.map(request => (
        <div
          key={request.requestId}
          className="p-4 border-b border-zinc-800"
        >
          <p className="text-white text-sm">{request.requesterUsername}</p>
          <p className="text-zinc-500 text-xs">{request.requesterPhone}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() =>
                dispatch(respondToFriendRequest({
                  requestId: request.requestId,
                  action: 'ACCEPT'
                }))
              }
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              Accept
            </button>

            <button
              onClick={() =>
                dispatch(respondToFriendRequest({
                  requestId: request.requestId,
                  action: 'REJECT'
                }))
              }
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
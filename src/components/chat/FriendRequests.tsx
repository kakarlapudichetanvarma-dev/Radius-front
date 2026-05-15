import {
  useDispatch,

  useSelector
} from 'react-redux';

import {
  acceptRequest,

  rejectRequest
} from '../../store/slices/friend.slice';

import type {
  RootState
} from '../../store';

export default function FriendRequests() {
  const dispatch =
    useDispatch();

  const requests =
    useSelector(
      (
        state:
          RootState
      ) =>
        state.friend
          .requests
    );

  return (
    <div
      className="
        border-b
        border-zinc-800
      "
    >
      {requests.map(
        request => (
          <div
            key={
              request.id
            }

            className="
              p-4
              border-b
              border-zinc-800
            "
          >
            <p>
              {
                request
                  .username
              }
            </p>

            <div
              className="
                flex
                gap-2
                mt-2
              "
            >
              <button
                onClick={() =>
                  dispatch(
                    acceptRequest(
                      request.id
                    )
                  )
                }

                className="
                  bg-green-600
                  px-3
                  py-1
                  rounded
                "
              >
                Accept
              </button>

              <button
                onClick={() =>
                  dispatch(
                    rejectRequest(
                      request.id
                    )
                  )
                }

                className="
                  bg-red-600
                  px-3
                  py-1
                  rounded
                "
              >
                Reject
              </button>

            </div>
          </div>
        )
      )}
    </div>
  );
}
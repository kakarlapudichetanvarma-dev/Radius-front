import {
  useDispatch,

  useSelector
} from 'react-redux';

import type {
  RootState
} from '../../store';

import {
  acceptCall,

  rejectCall
} from '../../store/slices/call.slice';

export default function IncomingCallModal() {
  const dispatch =
    useDispatch();

  const caller =
    useSelector(
      (
        state:
          RootState
      ) =>
        state.call
          .incomingCaller
    );

  if (!caller)
    return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/80
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div
        className="
          bg-zinc-900
          p-8
          rounded-xl
          text-center
          space-y-4
        "
      >
        <h2
          className="
            text-2xl
            font-bold
          "
        >
          Incoming Call
        </h2>

        <p>
          {caller}
        </p>

        <div
          className="
            flex
            gap-2
          "
        >
          <button
            onClick={() =>
              dispatch(
                acceptCall()
              )
            }

            className="
              bg-green-600
              px-4
              py-2
              rounded-xl
            "
          >
            Accept
          </button>

          <button
            onClick={() =>
              dispatch(
                rejectCall()
              )
            }

            className="
              bg-red-600
              px-4
              py-2
              rounded-xl
            "
          >
            Reject
          </button>

        </div>

      </div>
    </div>
  );
}
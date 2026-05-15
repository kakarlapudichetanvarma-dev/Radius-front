import {
  useState
} from 'react';

import AddFriendModal
  from './AddFriendModal';

export default function AddFriendButton() {
  const [
    open,
    setOpen
  ] = useState(false);

  return (
    <>
      {open && (
        <AddFriendModal
          onClose={() =>
            setOpen(
              false
            )
          }
        />
      )}

      <div className="p-4 border-b border-zinc-800">

        <button
          onClick={() =>
            setOpen(
              true
            )
          }

          className="
            w-full
            bg-green-600
            p-3
            rounded-xl
            font-semibold
          "
        >
          + Add Friend
        </button>

      </div>
    </>
  );
}
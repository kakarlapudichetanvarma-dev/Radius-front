import {
  useState
} from 'react';

import {
  useDispatch,

  useSelector
} from 'react-redux';

import type {
  RootState
} from '../../store';

import {
  setSelectedChat
} from '../../store/slices/chat.slice';

import CreateGroupModal
  from './CreateGroupModal';

export default function GroupList() {
  const dispatch =
    useDispatch();

  const [
    open,
    setOpen
  ] = useState(false);

  const groups =
    useSelector(
      (
        state:
          RootState
      ) =>
        state.group
          .groups
    );

  return (
    <div
      className="
        border-t
        border-zinc-800
      "
    >
      {open && (
        <CreateGroupModal
          onClose={() =>
            setOpen(
              false
            )
          }
        />
      )}

      <div
        className="
          p-4
          text-zinc-400
        "
      >
        Groups
      </div>

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
          mb-2
        "
      >
        + Create Group
      </button>

      {groups.map(
        group => (
          <button
            key={
              group.id
            }

            onClick={() =>
              dispatch(
                setSelectedChat({
  name:
    group.name,

  isGroup:
    true
})
              )
            }

            className="
              w-full
              text-left
              p-4
              border-b
              border-zinc-800
            "
          >
            👥 {
              group.name
            }
          </button>
        )
      )}

    </div>
  );
}
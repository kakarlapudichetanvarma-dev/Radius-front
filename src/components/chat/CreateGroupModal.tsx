import {
  useState
} from 'react';

import {
  useDispatch
} from 'react-redux';

import {
  addGroup
} from '../../store/slices/group.slice';

import {
  addSystemMessage,

  setSelectedChat
} from '../../store/slices/chat.slice';

const friends = [
  'Sami',
  'Vami',
  'Rahul'
];

interface Props {
  onClose: () => void;
}

export default function CreateGroupModal({
  onClose
}: Props) {
  const dispatch =
    useDispatch();

  const [
    name,
    setName
  ] = useState('');

  const [
    members,
    setMembers
  ] = useState<
    string[]
  >([]);

  const toggleMember =
    (
      friend:
        string
    ) => {
      if (
        members.includes(
          friend
        )
      ) {
        setMembers(
          previous =>
            previous.filter(
              member =>
                member !==
                friend
            )
        );

        return;
      }

      setMembers(
        previous => [
          ...previous,

          friend
        ]
      );
    };

  const handleCreate =
    () => {
      if (!name)
        return;

      const group =
        {
          id:
            Date.now()
              .toString(),

          name,

          members
        };

      dispatch(
        addGroup(
          group
        )
      );

      dispatch(
       setSelectedChat({
  name:
    group.name,

  isGroup:
    true
})
      );

      dispatch(
        addSystemMessage({
          id:
            `${Date.now()}-1`,

          sender:
            'system',

          type:
            'system',

          text:
            `${members.join(
              ', '
            )} joined at now`,

          time:
            'now',

          status:
            'read'
        })
      );

      dispatch(
        addSystemMessage({
          id:
            `${Date.now()}-2`,

          sender:
            'system',

          type:
            'system',

          text:
            'Added by Chetan',

          time:
            'now',

          status:
            'read'
        })
      );

      onClose();
    };

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/70
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
          w-full
          max-w-md
          space-y-4
        "
      >
        <h2
          className="
            text-2xl
            font-bold
          "
        >
          Create Group
        </h2>

        <input
          value={name}

          onChange={
            event =>
              setName(
                event.target
                  .value
              )
          }

          placeholder="Group name"

          className="
            w-full
            p-3
            rounded-xl
            bg-zinc-800
          "
        />

        {friends.map(
          friend => (
            <button
              key={
                friend
              }

              onClick={() =>
                toggleMember(
                  friend
                )
              }

              className="
                block
                w-full
                text-left
                p-3
                bg-zinc-800
                rounded-xl
              "
            >
              {
                members.includes(
                  friend
                )
                  ? '✅'
                  : '⬜'
              }

              {' '}

              {friend}
            </button>
          )
        )}

        <button
          onClick={
            handleCreate
          }

          className="
            w-full
            bg-green-600
            p-3
            rounded-xl
          "
        >
          Create
        </button>

      </div>
    </div>
  );
}
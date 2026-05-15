import {
  useForm
} from 'react-hook-form';

import {
  zodResolver
} from '@hookform/resolvers/zod';

import {
  z
} from 'zod';

const schema =
  z.object({
    phoneNumber:
      z.string().regex(
        /^[0-9]{10}$/,
        'Phone number must be 10 digits'
      )
  });

type FormData =
  z.infer<
    typeof schema
  >;

interface Props {
  onClose: () => void;
}

export default function AddFriendModal({
  onClose
}: Props) {
  const {
    register,

    handleSubmit,

    formState: {
      errors
    }
  } =
    useForm<FormData>({
      resolver:
        zodResolver(
          schema
        )
    });

  const onSubmit =
    (
      data: FormData
    ) => {
      console.log(
        'Friend request:',
        data
      );

      alert(
        'Friend request sent'
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
      <form
        onSubmit={handleSubmit(
          onSubmit
        )}

        className="
          bg-zinc-900
          p-8
          rounded-xl
          space-y-4
          w-full
          max-w-md
        "
      >
        <h2
          className="
            text-2xl
            font-bold
          "
        >
          Add Friend
        </h2>

        <input
          {...register(
            'phoneNumber'
          )}

          placeholder="Phone number"

          className="
            w-full
            p-3
            rounded-xl
            bg-zinc-800
          "
        />

        <p
          className="
            text-red-500
            text-sm
          "
        >
          {
            errors
              .phoneNumber
              ?.message
          }
        </p>

        <div
          className="
            flex
            gap-2
          "
        >
          <button
            type="submit"

            className="
              flex-1
              bg-green-600
              p-3
              rounded-xl
            "
          >
            Send
          </button>

          <button
            type="button"

            onClick={
              onClose
            }

            className="
              flex-1
              bg-zinc-700
              p-3
              rounded-xl
            "
          >
            Cancel
          </button>

        </div>
      </form>
    </div>
  );
}
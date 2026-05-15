interface Props {
  onClick: () => void;
}

export default function CallButton({
  onClick
}: Props) {
  return (
    <button
      onClick={
        onClick
      }

      className="
        text-2xl
      "
    >
      📞
    </button>
  );
}
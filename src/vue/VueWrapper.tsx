import {
  useEffect,
  useRef
} from 'react';

import {
  createApp
} from 'vue';

import EmojiPicker from './EmojiPicker.vue';

interface Props {
  onSelect: (
    emoji: string
  ) => void;
}

export default function VueWrapper({
  onSelect
}: Props) {
  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    if (
      !containerRef.current
    )
      return;

    const app =
      createApp(
        EmojiPicker,
        {
          onSelect
        }
      );

    app.mount(
      containerRef.current
    );

    return () => {
      app.unmount();
    };
  }, [onSelect]);

  return (
    <div
      ref={
        containerRef
      }
    />
  );
}
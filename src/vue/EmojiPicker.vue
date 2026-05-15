<template>
  <div class="grid grid-cols-6 gap-2 p-4 bg-zinc-900 rounded-xl">
    
    <button
      v-for="emoji in emojis"
      :key="emoji"

      @click="selectEmoji(emoji)"

      class="text-2xl"
    >
      {{ emoji }}
    </button>

  </div>
</template>

<script setup lang="ts">
const emojis = [
  '😀',
  '😍',
  '😂',
  '🔥',
  '👍',
  '🎉',
  '❤️',
  '😎',
  '🙏',
  '🚀',
  '💯',
  '😄'
];

const emit =
  defineEmits([
    'select'
  ]);

const selectEmoji = (
  emoji: string
) => {
  emit(
    'select',
    emoji
  );
};
</script>
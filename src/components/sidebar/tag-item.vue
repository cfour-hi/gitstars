<template>
  <button
    type="button"
    class="tag-item flex h-9 w-full cursor-pointer items-center justify-between border-t border-solid border-t-gray-700 px-4 text-left text-xs hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#948aec]"
  >
    <span class="flex h-full items-center">
      <svg-icon :name="tag.icon || 'tag'" />
      <span class="ml-2">{{ tag.label }}</span>
    </span>
    <span v-if="tag.count">{{ tag.count }}</span>
  </button>
</template>

<script setup>
defineProps({
  tag: {
    type: Object,
    required: true,
  },
});
</script>

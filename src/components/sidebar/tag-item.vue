<template>
  <div
    class="tag-item flex h-9 cursor-pointer items-center justify-between border-t border-solid border-t-gray-700 px-4 text-xs hover:bg-white/10"
  >
    <div class="flex h-full items-center">
      <svg-icon :name="tag.icon || 'tag'" />
      <span class="ml-2">{{ tag.label }}</span>
    </div>
    <span v-if="tag.count">{{ tag.count }}</span>
  </div>
</template>

<script setup>
defineProps({
  tag: {
    type: Object,
    required: true,
  },
});
</script>

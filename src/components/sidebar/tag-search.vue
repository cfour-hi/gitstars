<template>
  <section
    class="flex h-9 flex-none items-center border-t border-solid border-t-gray-700 px-5 text-xs"
  >
    <span class="flex-none">
      <svg-icon name="search" />
      <span class="mx-2">{{ $t('search') }}</span>
    </span>

    <span class="relative flex-auto">
      <input
        ref="refInput"
        type="text"
        :aria-label="$t('search')"
        class="peer w-full rounded bg-gray-700 px-2 py-1 outline-none focus:bg-white focus:text-black"
        @input="handleInputFilterTag"
      />
      <button
        v-show="filterText"
        type="button"
        class="absolute right-1 top-1.5 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#948aec] peer-focus:text-black"
        :aria-label="$t('clearSearch')"
        :title="$t('clearSearch')"
        @click="handleClickClose"
      >
        <svg-icon name="close" />
      </button>
    </span>

    <slot name="suffix" />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import debounce from 'lodash/debounce';

defineProps({
  /**
   * 当前过滤内容，由使用方传入（Topics/Languages 或排行榜各自的 store）
   */
  filterText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['input']);

const refInput = ref(null);

const handleInputFilterTag = debounce(({ target }) => {
  emit('input', target.value);
}, 300);

function handleClickClose() {
  refInput.value.value = '';
  emit('input', '');
}
</script>

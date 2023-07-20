<template>
  <section class="flex h-9 flex-none items-center px-5 text-xs">
    <span class="w-14 flex-none">
      <svg-icon name="search" class="mr-2" />
      <span>搜索</span>
    </span>

    <span class="relative flex-auto">
      <input
        ref="refInput"
        type="text"
        class="peer w-full rounded bg-gray-700 px-2 py-1 outline-none focus:bg-white focus:text-black"
        @input="handleInputFilterTag"
      />
      <svg-icon
        v-show="tagStore.filterText"
        name="close"
        class="absolute right-1 top-1.5 cursor-pointer peer-focus:text-black"
        @click="handleClickClose"
      />
    </span>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useTagStore } from '@/store/tag';
import { debounce } from 'lodash';

const tagStore = useTagStore();
const refInput = ref(null);

const handleInputFilterTag = debounce(({ target }) => {
  tagStore.$patch({ filterText: target.value });
}, 300);

function handleClickClose() {
  tagStore.$patch({ filterText: '' });
  refInput.value.value = '';
}
</script>

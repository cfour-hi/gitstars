<template>
  <section class="flex h-9 flex-none items-center px-5 text-xs">
    <span class="flex-none">
      <svg-icon name="search" class="" />
      <span class="ml-2">搜索</span>
    </span>

    <span class="relative mx-2 flex-auto">
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

    <div
      :aria-label="sortType.label"
      role="tooltip"
      data-microtip-position="top"
      class="flex-none cursor-pointer"
      @click="handleChangeSortType"
    >
      <svg-icon :name="sortType.icon" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTagStore } from '@/store/tag';
import { debounce } from 'lodash';
import { TAG_SORT_TYPE } from '@/constants';

const tagStore = useTagStore();
const refInput = ref(null);

const sortType = computed(() => TAG_SORT_TYPE[tagStore.sortType]);

const handleInputFilterTag = debounce(({ target }) => {
  tagStore.$patch({ filterText: target.value });
}, 300);

function handleClickClose() {
  tagStore.$patch({ filterText: '' });
  refInput.value.value = '';
}

function handleChangeSortType() {
  const newSortType =
    tagStore.sortType === TAG_SORT_TYPE.amountDown.value
      ? TAG_SORT_TYPE.amountUp.value
      : TAG_SORT_TYPE.amountDown.value;
  tagStore.$patch({ sortType: newSortType });
}
</script>

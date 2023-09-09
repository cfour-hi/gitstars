<template>
  <div class="flex h-9 items-center bg-gray-100 px-3 text-xs text-gray-500">
    <div class="relative flex-auto">
      <svg-icon name="search" class="absolute left-2 top-2 text-gray-400" />

      <input
        placeholder="开发者 | 仓库名 | 描述"
        ref="refInput"
        type="text"
        class="h-7 w-full flex-auto rounded-full bg-white px-6 outline-none"
        @input="handleInputRepositoryName"
      />

      <svg-icon
        v-show="repositoryStore.filterText"
        name="close"
        class="absolute right-2 top-2 cursor-pointer"
        @click="handleClickClose"
      />
    </div>

    <div
      v-show="tagStore.tagSrc === TAG_SRC.self"
      :aria-label="sortTypeLabel"
      role="tooltip"
      data-microtip-position="top"
      class="ml-2.5 cursor-pointer text-sm text-gray-400"
    >
      <svg-icon
        :name="repositoryStore.sortType"
        @click="handleChangeSortType"
      ></svg-icon>
    </div>

    <div
      v-if="
        tagStore.tagSrc === TAG_SRC.self &&
        repositoryStore.all.length !== 0 &&
        repositoryStore.loading
      "
      aria-label="仓库更新中"
      role="tooltip"
      data-microtip-position="top"
      class="ml-2.5 text-sm"
    >
      <svg-icon name="loading" class="animate-spin text-gray-400" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRepositoryStore } from '@/store/repository';
import { useTagStore } from '@/store/tag';
import { debounce } from 'lodash';
import { REPO_SORT_TYPE, TAG_SRC } from '@/constants';

const tagStore = useTagStore();
const repositoryStore = useRepositoryStore();
const refInput = ref(null);

const sortTypeLabel = computed(
  () => REPO_SORT_TYPE[repositoryStore.sortType].label,
);

const handleInputRepositoryName = debounce(({ target }) => {
  repositoryStore.$patch({ filterText: target.value });
}, 300);

function handleClickClose() {
  repositoryStore.$patch({ filterText: '' });
  refInput.value.value = '';
}

function handleChangeSortType() {
  const newSortType =
    repositoryStore.sortType === REPO_SORT_TYPE.time.value
      ? REPO_SORT_TYPE.star.value
      : REPO_SORT_TYPE.time.value;
  repositoryStore.$patch({ sortType: newSortType });
}
</script>

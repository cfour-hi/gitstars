<template>
  <div class="flex h-9 items-center bg-gray-100 px-3 text-xs text-gray-500">
    <div class="relative flex-auto">
      <svg-icon name="search" class="absolute left-2 top-2 text-gray-400" />

      <input
        :placeholder="$t('repo.filterTip', { div: '|' })"
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
      v-show="tagStore.tagSrc === 'star'"
      :aria-label="$t(`repo.sort.${repositoryStore.sortType}`)"
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
        tagStore.tagSrc === 'star' &&
        repositoryStore.all.length !== 0 &&
        repositoryStore.loading
      "
      :aria-label="$t('repo.updating')"
      role="tooltip"
      data-microtip-position="top"
      class="ml-2.5 text-sm"
    >
      <svg-icon name="loading" class="animate-spin text-gray-400" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRepositoryStore } from '@/store/repository';
import { useTagStore } from '@/store/tag';
import { debounce } from 'lodash';

const tagStore = useTagStore();
const repositoryStore = useRepositoryStore();
const refInput = ref(null);

const handleInputRepositoryName = debounce(({ target }) => {
  repositoryStore.$patch({ filterText: target.value });
}, 300);

function handleClickClose() {
  repositoryStore.$patch({ filterText: '' });
  refInput.value.value = '';
}

function handleChangeSortType() {
  const newSortType = repositoryStore.sortType === 'time' ? 'star' : 'time';
  repositoryStore.$patch({ sortType: newSortType });
}
</script>

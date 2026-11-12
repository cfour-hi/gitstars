<template>
  <div class="flex h-9 items-center bg-gray-100 px-3 text-xs text-gray-500">
    <div class="relative flex-auto">
      <svg-icon name="search" class="absolute left-2 top-2 text-gray-400" />

      <input
        :placeholder="$t('repo.filterTip', { div: '|' })"
        ref="refInput"
        type="text"
        :aria-label="$t('repo.filter')"
        class="h-7 w-full flex-auto rounded-full bg-white px-6 outline-none"
        @input="handleInputRepositoryName"
      />

      <button
        v-show="repositoryStore.filterText"
        type="button"
        :aria-label="$t('clearSearch')"
        :title="$t('clearSearch')"
        class="absolute right-2 top-2 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#948aec]"
        @click="handleClickClose"
      >
        <svg-icon name="close" />
      </button>
    </div>

    <button
      v-show="tagStore.tagSrc === 'star'"
      type="button"
      :aria-label="$t(`repo.sort.${repositoryStore.sortType}`)"
      :title="$t(`repo.sort.${repositoryStore.sortType}`)"
      class="ml-2.5 cursor-pointer rounded text-sm text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#948aec]"
      @click="handleChangeSortType"
    >
      <svg-icon :name="repositoryStore.sortType" />
    </button>

    <span
      v-if="
        tagStore.tagSrc === 'star' &&
        repositoryStore.all.length !== 0 &&
        repositoryStore.loading
      "
      role="status"
      :aria-label="$t('repo.updating')"
      :title="$t('repo.updating')"
      class="ml-2.5 text-sm"
    >
      <svg-icon name="loading" class="animate-spin text-gray-400" />
    </span>

    <button
      v-else-if="tagStore.tagSrc === 'star' && repositoryStore.error"
      type="button"
      :aria-label="$t('repo.loadFailed')"
      :title="$t('repo.loadFailed')"
      class="ml-2.5 cursor-pointer rounded text-sm text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#948aec]"
      @click="handleRetryRepositories"
    >
      <svg-icon name="close" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRepositoryStore } from '@/store/repository';
import { useTagStore } from '@/store/tag';
import debounce from 'lodash/debounce';

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

function handleRetryRepositories() {
  repositoryStore.resolveRepositories();
}
</script>

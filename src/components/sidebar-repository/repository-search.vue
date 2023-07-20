<template>
  <div class="flex h-9 items-center bg-gray-100 px-3 text-xs text-gray-500">
    <div class="relative flex-auto">
      <svg-icon name="search" class="absolute left-2 top-2 text-gray-400" />

      <input
        :placeholder="`开发者 | 仓库名 @${tagStore.selected || '全部'}`"
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

    <div v-tooltip:right.tooltip="'仓库更新中'">
      <svg-icon
        v-show="repositoryStore.all.length !== 0 && repositoryStore.loading"
        name="loading"
        class="ml-2.5 animate-spin text-sm"
      />
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
</script>

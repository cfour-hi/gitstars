<template>
  <div
    class="relative w-96 flex-none border-r border-solid border-r-gray-300 bg-white"
  >
    <RepositorySearch />

    <DynamicScroller
      ref="refRepositoryList"
      :items="repositoryStore.filteredRepositories"
      :min-item-size="100"
      key-field="id"
      class="scrollbar-thumb:bg-slate-300 overflow-y-auto overflow-x-hidden"
      style="height: calc(100% - 2.25rem)"
      @click="handleClickRepository"
    >
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem
          class="cursor-pointer border-b border-solid border-b-gray-300 p-4"
          :item="item"
          :active="active"
          :size-dependencies="[
            item.name,
            item.topics,
            item.description,
            item.language,
          ]"
          :data-repository-id="item.id"
          :data-index="index"
          :class="{
            selected: item.id === repositoryStore.selectedId,
          }"
        >
          <RepositoryCard :repository="item" />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <svg-icon
      v-show="
        tagStore.tagSrc === TAG_SRC.self && repositoryStore.all.length === 0
      "
      name="loading"
      class="absolute left-1/2 top-1/3 -ml-3 animate-spin text-2xl text-gray-300"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import RepositoryCard from './repository-card.vue';
import RepositorySearch from './repository-search.vue';
import { useRepositoryStore } from '@/store/repository';
import { useTagStore } from '@/store/tag';
import { TAG_SRC } from '@/constants';

const repositoryStore = useRepositoryStore();
const tagStore = useTagStore();
const refRepositoryList = ref(null);

watch(
  () => repositoryStore.filteredRepositories,
  () => {
    refRepositoryList.value?.$el.scrollTo({ top: 0 });
  },
);

function handleClickRepository(e) {
  let elRepository = e.target;
  while (!elRepository.dataset.repositoryId) {
    elRepository = elRepository.parentElement;
    if (!elRepository) return;
  }
  repositoryStore.$patch({
    selectedId: Number(elRepository.dataset.repositoryId),
  });
}

repositoryStore.resolveRepositories();
</script>

<style scoped>
.selected {
  background-color: #f7f7f7;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.1);
}

:deep(.vue-recycle-scroller__item-wrapper) {
  overflow: visible;
}
</style>

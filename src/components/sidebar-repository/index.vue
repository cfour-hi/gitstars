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
      role="group"
      :aria-label="$t('repositoryList')"
      class="overflow-y-auto overflow-x-hidden"
      style="height: calc(100% - 2.25rem)"
      @click="handleClickRepository"
      @keydown="handleKeydownRepository"
    >
      <template v-slot="{ item, active }">
        <DynamicScrollerItem
          class="cursor-pointer border-b border-solid border-b-gray-300 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#948aec]"
          :item="item"
          :active="active"
          :size-dependencies="[
            item.name,
            item.topics,
            item.description,
            item.language,
          ]"
          :data-repository-id="item.id"
          tabindex="0"
          :aria-current="
            item.id === repositoryStore.selectedId ? 'true' : undefined
          "
          :class="{
            selected: item.id === repositoryStore.selectedId,
          }"
        >
          <RepositoryCard :repository="item" />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <span
      v-show="repositoryStore.loading && repositoryStore.all.length === 0"
      role="status"
      :aria-label="$t('loading')"
      class="absolute left-1/2 top-1/3 -ml-3 text-2xl text-gray-300"
    >
      <svg-icon name="loading" class="animate-spin" />
    </span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import RepositoryCard from './repository-card.vue';
import RepositorySearch from './repository-search.vue';
import { useRepositoryStore } from '@/store/repository';

const repositoryStore = useRepositoryStore();
const refRepositoryList = ref(null);

watch(
  () => repositoryStore.filteredRepositories,
  () => {
    refRepositoryList.value?.$el.scrollTo({ top: 0 });
    // 刷新时直接替换整个数组，虚拟列表需要重新计算可见项
    refRepositoryList.value?.forceUpdate?.();
  },
);

function selectRepository(id) {
  repositoryStore.$patch({ selectedId: id });
}

function handleClickRepository(e) {
  let elRepository = e.target;
  while (!elRepository.dataset.repositoryId) {
    elRepository = elRepository.parentElement;
    if (!elRepository) return;
  }
  selectRepository(Number(elRepository.dataset.repositoryId));
}

function handleKeydownRepository(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;

  // 只在行本身获得焦点时响应，避免拦截行内链接、Topics 按钮的按键
  const repositoryId = e.target?.dataset?.repositoryId;
  if (!repositoryId) return;

  e.preventDefault();
  selectRepository(Number(repositoryId));
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

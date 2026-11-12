<template>
  <ul
    role="tablist"
    :aria-label="$t('categoryNavLabel')"
    class="flex h-8 flex-none justify-between border-t border-solid border-gray-600 text-xs"
  >
    <li
      v-for="tab in tabList"
      :key="tab"
      :id="`tag-src-tab-${tab}`"
      :ref="(el) => setTabRef(el, tab)"
      :class="{ selected: tab === tagStore.tagSrc }"
      class="h-full w-1/3 flex-auto cursor-pointer border-r border-solid border-gray-500 text-center capitalize leading-8 last:border-none"
      role="tab"
      :aria-selected="tab === tagStore.tagSrc"
      :aria-controls="`tag-src-panel-${tab}`"
      :tabindex="tab === tagStore.tagSrc ? 0 : -1"
      @click="handleClickTab(tab)"
      @keydown="handleKeydownTab($event, tab)"
    >
      {{ $t(`category.${tab}`) }}
      <svg-icon
        v-show="toTabLoading(tab)"
        name="loading"
        class="animate-spin"
      />
    </li>
  </ul>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { useTagStore } from '@/store/tag';
import { useRankingStore } from '@/store/ranking';
import { useRepositoryStore } from '@/store/repository';

const tabList = ['star', 'ranking'];
const tagStore = useTagStore();
const rankingStore = useRankingStore();
const repositoryStore = useRepositoryStore();
const tabRefs = ref([]);

const setTabRef = (el, tab) => {
  if (el) tabRefs.value[tabList.indexOf(tab)] = el;
};

const focusTab = async (tab) => {
  await nextTick();
  tabRefs.value[tabList.indexOf(tab)]?.focus();
};

const toTabLoading = (tab) =>
  tab === 'ranking' &&
  (rankingStore.rankingLoading || rankingStore.languageLoading);

function handleClickTab(tab) {
  if (tab === tagStore.tagSrc) return;

  // 切换数据源时清空另一侧的筛选和选中项，避免内容区显示上一个数据源的数据
  tagStore.$patch({
    tagSrc: tab,
    selectedTag: '',
    selectedTagType: '',
  });
  repositoryStore.$patch({ selectedId: null });
}

function handleKeydownTab(event, tab) {
  const index = tabList.indexOf(tab);
  let targetIndex;

  if (event.key === 'ArrowRight') {
    targetIndex = (index + 1) % tabList.length;
  } else if (event.key === 'ArrowLeft') {
    targetIndex = (index - 1 + tabList.length) % tabList.length;
  } else if (event.key === 'Home') {
    targetIndex = 0;
  } else if (event.key === 'End') {
    targetIndex = tabList.length - 1;
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClickTab(tab);
    return;
  } else {
    return;
  }

  event.preventDefault();
  const target = tabList[targetIndex];
  handleClickTab(target);
  focusTab(target);
}
</script>

<style scoped>
.selected {
  position: relative;
  background-color: #ffffff22;
}

.selected::before {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary);
}
</style>

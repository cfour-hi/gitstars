<template>
  <ul
    role="tablist"
    :aria-label="$t('tagTypeNavLabel')"
    class="flex h-8 flex-none justify-between border-t border-solid border-gray-600 text-xs"
  >
    <li
      v-for="nav in navList"
      :key="nav"
      :id="`tag-type-tab-${nav}`"
      :ref="(el) => setNavRef(el, nav)"
      :class="{ selected: nav === tagStore.selectedTagTypeNav }"
      class="h-full w-1/3 flex-auto cursor-pointer border-r border-solid border-gray-500 text-center capitalize leading-8 last:border-none"
      role="tab"
      :aria-selected="nav === tagStore.selectedTagTypeNav"
      :aria-controls="`tag-type-panel-${nav}`"
      :tabindex="nav === tagStore.selectedTagTypeNav ? 0 : -1"
      @click="handleClickNav(nav)"
      @keydown="handleKeydownNav($event, nav)"
    >
      {{ $t(`tagType.${nav}`) }}
    </li>
  </ul>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { useTagStore } from '@/store/tag';

const navList = ['language', 'topic'];
const tagStore = useTagStore();
const navRefs = ref([]);

const setNavRef = (el, nav) => {
  if (el) navRefs.value[navList.indexOf(nav)] = el;
};

const focusNav = async (nav) => {
  await nextTick();
  navRefs.value[navList.indexOf(nav)]?.focus();
};

function handleClickNav(nav) {
  if (nav === tagStore.selectedTagTypeNav) return;

  // 切换 Topics/Languages 时清空已选 tag，避免列表被不可见的 tag 过滤
  tagStore.$patch({
    selectedTagTypeNav: nav,
    selectedTag: '',
    selectedTagType: '',
  });
}

function handleKeydownNav(event, nav) {
  const index = navList.indexOf(nav);
  let targetIndex;

  if (event.key === 'ArrowRight') {
    targetIndex = (index + 1) % navList.length;
  } else if (event.key === 'ArrowLeft') {
    targetIndex = (index - 1 + navList.length) % navList.length;
  } else if (event.key === 'Home') {
    targetIndex = 0;
  } else if (event.key === 'End') {
    targetIndex = navList.length - 1;
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClickNav(nav);
    return;
  } else {
    return;
  }

  event.preventDefault();
  const target = navList[targetIndex];
  handleClickNav(target);
  focusNav(target);
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

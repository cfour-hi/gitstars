<template>
  <ul
    class="broder-solid flex h-8 flex-none justify-between border-t border-gray-600 text-xs"
  >
    <li
      v-for="nav in navList"
      :key="nav"
      :class="{ selected: nav === tagStore.tagSrc }"
      class="h-full w-1/3 flex-auto cursor-pointer border-r border-solid border-gray-500 text-center capitalize leading-8 last:border-none"
      @click="handleClickNav(nav)"
    >
      {{ labels[nav] }}
    </li>
  </ul>
</template>

<script setup>
import { useTagStore } from '@/store/tag';
import { TAG_SRC } from '@/constants';

const labels = {
  [TAG_SRC.self]: 'Your Stars',
  [TAG_SRC.github]: 'Github Ranking',
};

const navList = Object.values(TAG_SRC);
const tagStore = useTagStore();

function handleClickNav(nav) {
  tagStore.$patch({ tagSrc: nav });
}
</script>

<style scoped>
.selected {
  position: relative;
  background: #ffffff22;
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

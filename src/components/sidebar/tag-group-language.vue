<template>
  <ul @click="handleSelectTag">
    <TagItem
      v-for="item in languageList"
      :key="item.label"
      :tag="item"
      :data-language="item.label"
      :class="{ selected: item.label === tagStore.selected }"
    />
  </ul>
</template>

<script setup>
import { computed } from 'vue';
import { useLanguageStore } from '@/store/language';
import { useTagStore } from '@/store/tag';
import { TAG_TYPE } from '@/constants';
import TagItem from './tag-item.vue';

const languageStore = useLanguageStore();
const tagStore = useTagStore();

const languageList = computed(() => {
  const filterText = tagStore.filterText.toLowerCase();
  return Object.keys(languageStore.languageMap)
    .filter((key) => key.toLowerCase().includes(filterText))
    .map((key) => ({
      label: key,
      count: languageStore.languageMap[key].length,
    }));
});

function handleSelectTag(e) {
  let elTag = e.target;
  while (!elTag.dataset.language) {
    elTag = elTag.parentElement;
    if (!elTag) return;
  }
  tagStore.$patch({
    selectedType: TAG_TYPE.language,
    selected: elTag.dataset.language,
  });
}
</script>

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
import { useTagStore } from '@/store/tag';
import { TAG_TYPE } from '@/constants';
import TagItem from './tag-item.vue';

const tagStore = useTagStore();

const languageList = computed(() => {
  const filterText = tagStore.filterText.toLowerCase();
  return Object.keys(tagStore.languageMap)
    .filter((key) => key.toLowerCase().includes(filterText))
    .map((key) => ({
      label: key,
      count: tagStore.languageMap[key].length,
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

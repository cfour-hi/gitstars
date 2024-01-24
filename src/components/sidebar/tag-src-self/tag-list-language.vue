<template>
  <ul @click="handleSelectTag">
    <TagItem
      v-for="item in tagList"
      :key="item.label"
      :tag="item"
      :data-language="item.label"
      :class="{ selected: item.label === tagStore.selectedTag }"
    />
  </ul>
</template>

<script setup>
import { computed } from 'vue';
import { useTagStore } from '@/store/tag';
import { useTag } from '@/hooks/tag';
import TagItem from '../tag-item.vue';

const tagStore = useTagStore();
const { toTagList, onSelectTag } = useTag();
const tagList = computed(() => toTagList(tagStore.languageMap));
const handleSelectTag = onSelectTag('language');
</script>

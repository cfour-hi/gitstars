<template>
  <RecycleScroller
    :items="topicList"
    :item-size="itemSize"
    key-field="label"
    style="height: 100%"
    @click="handleSelectTag"
  >
    <template v-slot="{ item }">
      <TagItem
        :tag="item"
        :data-topic="item.label"
        :class="{ selected: item.label === tagStore.selected }"
      />
    </template>
  </RecycleScroller>
</template>

<script setup>
import { computed } from 'vue';
import { useTagStore } from '@/store/tag';
import { useUserStore } from '@/store/user';
import { TAG_TYPE, TAG_SORT_TYPE } from '@/constants';
import TagItem from './tag-item.vue';

const tagStore = useTagStore();
const userStore = useUserStore();

const topicList = computed(() => {
  const filterText = tagStore.filterText.toLowerCase();
  return Object.keys(tagStore.topicMap)
    .filter((key) => key.toLowerCase().includes(filterText))
    .map((key) => ({
      label: key,
      count: tagStore.topicMap[key].length,
    }))
    .sort((a, b) => {
      if (tagStore.sortType === TAG_SORT_TYPE.amountUp.value) {
        return a.count - b.count;
      }
      return b.count - a.count;
    });
});

const itemSize = computed(() => {
  return (userStore.htmlFontSize / 4) * 9;
});

function handleSelectTag(e) {
  let elTag = e.target;
  while (!elTag.dataset.topic) {
    elTag = elTag.parentElement;
    if (!elTag) return;
  }
  tagStore.$patch({
    selectedType: TAG_TYPE.topic,
    selected: elTag.dataset.topic,
  });
}
</script>

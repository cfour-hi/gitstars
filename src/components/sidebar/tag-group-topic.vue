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
import { useTopicStore } from '@/store/topic';
import { useTagStore } from '@/store/tag';
import { useUserStore } from '@/store/user';
import { TAG_TYPE } from '@/constants';
import TagItem from './tag-item.vue';

const topicStore = useTopicStore();
const tagStore = useTagStore();
const userStore = useUserStore();

const topicList = computed(() => {
  const filterText = tagStore.filterText.toLowerCase();
  return Object.keys(topicStore.topicMap)
    .filter((key) => key.toLowerCase().includes(filterText))
    .map((key) => ({
      label: key,
      count: topicStore.topicMap[key].length,
    }));
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

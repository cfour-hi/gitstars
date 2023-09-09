<template>
  <RecycleScroller
    :items="tagList"
    :item-size="itemSize"
    key-field="label"
    style="height: 100%"
    @click="handleSelectTag"
  >
    <template v-slot="{ item }">
      <TagItem
        :tag="item"
        :data-topic="item.label"
        :class="{ selected: item.label === tagStore.selectedTag }"
      />
    </template>
  </RecycleScroller>
</template>

<script setup>
import { computed } from 'vue';
import { useTagStore } from '@/store/tag';
import { useUserStore } from '@/store/user';
import { useTag } from '@/hooks/tag';
import { TAG_TYPE } from '@/constants';
import TagItem from '../tag-item.vue';

const tagStore = useTagStore();
const userStore = useUserStore();
const { toTagList, onSelectTag } = useTag();
const tagList = computed(() => toTagList(tagStore.topicMap));
const handleSelectTag = onSelectTag(TAG_TYPE.topic);
const itemSize = computed(() => (userStore.htmlFontSize / 4) * 9);
</script>

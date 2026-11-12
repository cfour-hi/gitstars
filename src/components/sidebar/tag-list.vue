<template>
  <RecycleScroller
    :items="tagList"
    :item-size="itemSize"
    key-field="label"
    class="h-full"
    @click="handleSelectTag"
  >
    <template v-slot="{ item }">
      <TagItem
        :tag="item"
        v-bind="{ [`data-${props.tagType}`]: item.label }"
        :aria-pressed="item.label === tagStore.selectedTag"
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
import TagItem from './tag-item.vue';

const props = defineProps({
  /**
   * tag 类型，决定使用 topicMap 还是 languageMap
   */
  tagType: {
    type: String,
    required: true,
    validator: (value) => ['topic', 'language'].includes(value),
  },
});

const tagStore = useTagStore();
const userStore = useUserStore();
const { toTagList, onSelectTag } = useTag();

const tagList = computed(() => toTagList(tagStore[`${props.tagType}Map`]));
const handleSelectTag = onSelectTag(props.tagType);

// 与 TagItem 的 h-9（2.25rem）保持一致
const itemSize = computed(() => (userStore.htmlFontSize / 4) * 9);
</script>

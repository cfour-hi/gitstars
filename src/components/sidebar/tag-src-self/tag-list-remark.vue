<template>
  <RecycleScroller
    :items="tagList"
    :item-size="itemSize"
    key-field="repositoryId"
    style="height: 100%"
    @click="handleSelectTag"
  >
    <template v-slot="{ item }">
      <TagItem
        :tag="item"
        :data-remark="item.repositoryId"
        :class="{
          selected:
            tagStore.selectedTagType === 'remark' &&
            String(item.repositoryId) === String(tagStore.selectedTag),
        }"
      />
    </template>
  </RecycleScroller>
</template>

<script setup>
import { computed } from 'vue';
import { useRemarkStore } from '@/store/remark';
import { useRepositoryStore } from '@/store/repository';
import { useTagStore } from '@/store/tag';
import { useUserStore } from '@/store/user';
import { toRemarkTagList } from '@/utils/remark';
import TagItem from '../tag-item.vue';

const remarkStore = useRemarkStore();
const repositoryStore = useRepositoryStore();
const tagStore = useTagStore();
const userStore = useUserStore();

const tagList = computed(() =>
  toRemarkTagList(
    repositoryStore.all,
    remarkStore.remarks,
    tagStore.filterText,
  ),
);
const itemSize = computed(() => (userStore.htmlFontSize / 4) * 9);

function handleSelectTag(e) {
  let elTag = e.target;
  while (!elTag.dataset.remark) {
    elTag = elTag.parentElement;
    if (!elTag) return;
  }

  tagStore.$patch({
    selectedTag: elTag.dataset.remark,
    selectedTagType: 'remark',
  });
}
</script>

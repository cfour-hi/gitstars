<template>
  <div class="relative flex h-0 flex-auto flex-col">
    <TagItem
      :tag="{
        label: $t('all'),
        icon: 'all-application',
        count: repositoryStore.all.length,
      }"
      :class="{ selected: !tagStore.selectedTag }"
      class="mr-1 flex-none"
      @click="handleClickTagAll"
    />

    <template v-if="repositoryStore.all.length > 0">
      <TagSearch @input="handleInputSearch">
        <template #suffix>
          <div
            :aria-label="$t(`sort.${tagStore.sortType}`)"
            role="tooltip"
            data-microtip-position="top"
            class="ml-2 flex-none cursor-pointer"
            @click="handleChangeSortType"
          >
            <svg-icon :name="`sort-${tagStore.sortType}`" />
          </div>
        </template>
      </TagSearch>

      <section class="flex-auto overflow-auto">
        <TagListLanguage v-show="tagStore.selectedTagTypeNav === 'language'" />
        <TagListTopic v-show="tagStore.selectedTagTypeNav === 'topic'" />
      </section>

      <TagTypeNav />
    </template>

    <svg-icon
      v-else
      name="loading"
      class="absolute left-1/2 top-1/3 -ml-3 animate-spin text-2xl text-gray-300"
    />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useTagStore } from '@/store/tag';
import { useRepositoryStore } from '@/store/repository';
import TagItem from '../tag-item.vue';
import TagSearch from '../tag-search.vue';
import TagListTopic from './tag-list-topic.vue';
import TagListLanguage from './tag-list-language.vue';
import TagTypeNav from './tag-type-nav.vue';

const tagStore = useTagStore();
const repositoryStore = useRepositoryStore();

watch(
  () => repositoryStore.all,
  () => {
    tagStore.analyze();
  },
  { deep: true },
);

const handleClickTagAll = () => {
  tagStore.$patch({ selectedTag: '' });
};

const handleInputSearch = (val) => {
  tagStore.$patch({ filterText: val });
};

const handleChangeSortType = () => {
  const newSortType = tagStore.sortType === 'descend' ? 'ascend' : 'descend';
  tagStore.$patch({ sortType: newSortType });
};
</script>

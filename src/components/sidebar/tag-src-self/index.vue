<template>
  <div class="relative flex h-0 flex-auto flex-col">
    <TagItem
      :tag="{
        label: $t('all'),
        icon: 'all-application',
        count: repositoryStore.all.length,
      }"
      :aria-pressed="!tagStore.selectedTag"
      :class="{ selected: !tagStore.selectedTag }"
      class="mr-1 flex-none"
      @click="handleClickTagAll"
    />

    <template v-if="repositoryStore.all.length > 0">
      <TagSearch :filter-text="tagStore.filterText" @input="handleInputSearch">
        <template #suffix>
          <button
            type="button"
            class="ml-2 flex-none cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#948aec]"
            :aria-label="$t(`sort.${tagStore.sortType}`)"
            :title="$t(`sort.${tagStore.sortType}`)"
            @click="handleChangeSortType"
          >
            <svg-icon :name="`sort-${tagStore.sortType}`" />
          </button>
        </template>
      </TagSearch>

      <section class="flex-auto overflow-auto">
        <div
          v-show="tagStore.selectedTagTypeNav === 'language'"
          id="tag-type-panel-language"
          role="tabpanel"
          aria-labelledby="tag-type-tab-language"
          class="h-full"
        >
          <TagList tag-type="language" />
        </div>
        <div
          v-show="tagStore.selectedTagTypeNav === 'topic'"
          id="tag-type-panel-topic"
          role="tabpanel"
          aria-labelledby="tag-type-tab-topic"
          class="h-full"
        >
          <TagList tag-type="topic" />
        </div>
      </section>

      <TagTypeNav />
    </template>

    <span
      v-else-if="repositoryStore.loading"
      role="status"
      :aria-label="$t('loading')"
      class="absolute left-1/2 top-1/3 -ml-3 text-2xl text-gray-300"
    >
      <svg-icon name="loading" class="animate-spin" />
    </span>

    <div v-else class="px-4 py-6 text-center text-xs text-gray-400">
      <p>
        {{
          repositoryStore.error
            ? $t('repo.loadFailed')
            : $t('emptyRepositories')
        }}
      </p>
      <button
        v-if="repositoryStore.error"
        type="button"
        class="mt-2 underline"
        @click="handleRetry"
      >
        {{ $t('retry') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useTagStore } from '@/store/tag';
import { useRepositoryStore } from '@/store/repository';
import TagItem from '../tag-item.vue';
import TagSearch from '../tag-search.vue';
import TagList from '../tag-list.vue';
import TagTypeNav from './tag-type-nav.vue';

const tagStore = useTagStore();
const repositoryStore = useRepositoryStore();

watch(
  () => repositoryStore.all,
  () => {
    tagStore.analyze();
  },
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

const handleRetry = () => {
  repositoryStore.resolveRepositories();
};
</script>

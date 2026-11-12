<template>
  <div class="flex h-0 flex-auto flex-col">
    <TagItem
      :tag="{
        label: $t('all'),
        icon: 'all-application',
      }"
      :aria-pressed="!rankingStore.selectedLanguage"
      :class="{ selected: !rankingStore.selectedLanguage }"
      class="mr-1 flex-none"
      @click="handleClickTagAll"
    />

    <TagSearch
      :filter-text="rankingStore.filterText"
      @input="handleInputSearch"
    />

    <span
      v-if="rankingStore.rankingLoading || rankingStore.languageLoading"
      role="status"
      :aria-label="$t('loading')"
      class="mx-auto my-4 block w-fit text-xl text-gray-400"
    >
      <svg-icon name="loading" class="animate-spin" />
    </span>

    <div
      v-else-if="rankingStore.rankingError || rankingStore.languageError"
      class="px-4 py-4 text-center text-xs text-gray-400"
    >
      <p>{{ $t('repo.loadFailed') }}</p>
      <button class="mt-2 underline" @click="handleRetryRanking">
        {{ $t('retry') }}
      </button>
    </div>

    <ul v-else class="flex-auto overflow-auto" @click="handleSelectTag">
      <li v-for="language in languageList" :key="language">
        <TagItem
          :tag="{
            label: language,
          }"
          :data-language="language"
          :aria-pressed="language === rankingStore.selectedLanguage"
          :class="{ selected: language === rankingStore.selectedLanguage }"
        />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRankingStore } from '@/store/ranking';
import { useTagStore } from '@/store/tag';
import TagItem from './tag-item.vue';
import TagSearch from './tag-search.vue';

const rankingStore = useRankingStore();
const tagStore = useTagStore();

// 排行榜数据较大（约 1.3 MB），只在用户第一次切换到排行榜时加载
function ensureRankingData() {
  rankingStore.resolveLanguageList();
  rankingStore.resolveLanguageMap();
}

watch(
  () => tagStore.tagSrc,
  (tagSrc) => {
    if (tagSrc === 'ranking') ensureRankingData();
  },
  { immediate: true },
);

const languageList = computed(() => {
  const filterText = rankingStore.filterText.toLowerCase();
  return rankingStore.languageList.filter((key) =>
    key.toLowerCase().includes(filterText),
  );
});

const handleClickTagAll = () => {
  rankingStore.$patch({
    selectedLanguage: '',
  });
};

const handleInputSearch = (val) => {
  rankingStore.$patch({ filterText: val });
};

const handleRetryRanking = () => {
  ensureRankingData();
};

const handleSelectTag = (e) => {
  let elTag = e.target;
  while (!elTag.dataset.language) {
    elTag = elTag.parentElement;
    if (!elTag) return;
  }

  const { language } = elTag.dataset;
  rankingStore.$patch({
    selectedLanguage: language,
  });
};
</script>

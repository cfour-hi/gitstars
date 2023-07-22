<template>
  <div class="flex h-full w-72 flex-none flex-col bg-[#28343d] text-[#ddd]">
    <a :href="BRAND_URI">
      <h1
        class="brand-text flex h-16 flex-none items-center justify-center font-['gitstars'] text-3xl font-bold uppercase text-[#948aec]"
      >
        <svg-icon name="logo" class="mr-1" />
        {{ BRAND }}
      </h1>
    </a>

    <TagItem
      :tag="{
        label: '全部',
        icon: 'all-application',
        value: repositoryStore.all.length,
      }"
      :class="{ selected: !tagStore.selected }"
      class="mr-1 flex-none"
      @click="handleClickTagAll"
    />

    <TagSearch />

    <section ref="refTagGroup" class="flex-auto overflow-auto">
      <TagGroupLanguage v-show="tagStore.selectedNav === TAG_TYPE.language" />
      <TagGroupTopic v-show="tagStore.selectedNav === TAG_TYPE.topic" />
    </section>

    <TagNav />

    <footer
      class="brand-text h-8 flex-none border-t border-solid border-white/10 text-sm font-bold"
    >
      <a
        :href="userStore.userinfo.html_url"
        class="flex h-full items-center justify-center"
        rel="noopener noreferrer"
      >
        Author：
        <h1>
          {{ userStore.userinfo.html_url.split('/').pop() }}
        </h1>
      </a>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import TagItem from './tag-item.vue';
import TagSearch from './tag-search.vue';
import TagGroupTopic from './tag-group-topic.vue';
import TagGroupLanguage from './tag-group-language.vue';
import TagNav from './tag-nav.vue';
import { useUserStore } from '@/store/user';
import { useTagStore } from '@/store/tag';
import { useRepositoryStore } from '@/store/repository';
import { BRAND, TAG_TYPE, BRAND_URI } from '@/constants';

const userStore = useUserStore();
const tagStore = useTagStore();
const repositoryStore = useRepositoryStore();
const refTagGroup = ref(null);

watch(
  () => repositoryStore.all,
  () => {
    tagStore.analyze();
  },
  { deep: true },
);

function handleClickTagAll() {
  tagStore.$patch({ selected: '' });
}
</script>

<style scoped>
:deep(.tag-item) {
  border-left: 0.25rem solid transparent;
}

:deep(.tag-item.selected) {
  border-left-color: var(--primary);
  background-color: #ffffff22;
}
</style>

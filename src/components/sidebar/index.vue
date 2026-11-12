<template>
  <div class="flex h-full w-72 flex-none flex-col bg-[#28343d] text-[#ddd]">
    <a :href="BRAND_URI" rel="noopener noreferrer">
      <h1
        class="brand-text flex h-16 flex-none items-center justify-center font-['gitstars'] text-3xl font-bold uppercase text-[#948aec]"
      >
        <svg-icon name="logo" class="mr-1" />
        {{ BRAND }}
      </h1>
    </a>

    <TagSrcTab />

    <TagSrcTabSelf
      v-show="tagStore.tagSrc === 'star'"
      id="tag-src-panel-star"
      role="tabpanel"
      aria-labelledby="tag-src-tab-star"
    />
    <TagSrcGithub
      v-show="tagStore.tagSrc === 'ranking'"
      id="tag-src-panel-ranking"
      role="tabpanel"
      aria-labelledby="tag-src-tab-ranking"
    />

    <footer
      class="brand-text h-8 flex-none border-t border-solid border-white/10 text-sm font-bold"
    >
      <a
        :href="userStore.userinfo.html_url"
        class="flex h-full items-center justify-center"
        rel="noopener noreferrer"
        target="_blank"
      >
        <span class="mr-1">{{ $t('signedInAs') }}</span>
        <span>{{ userStore.userinfo.login }}</span>
        <svg-icon name="share" class="ml-1 text-xs text-[#76d0a3]" />
      </a>
    </footer>
  </div>
</template>

<script setup>
import TagSrcTab from './tag-src-tab.vue';
import TagSrcTabSelf from './tag-src-self/index.vue';
import TagSrcGithub from './tag-src-github.vue';
import { useUserStore } from '@/store/user';
import { useTagStore } from '@/store/tag';
import { BRAND, BRAND_URI } from '@/constants';

const userStore = useUserStore();
const tagStore = useTagStore();
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

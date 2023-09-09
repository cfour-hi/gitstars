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

    <TagSrcTab />

    <TagSrcTabSelf v-show="tagStore.tagSrc === TAG_SRC.self" />
    <TagSrcGithub v-show="tagStore.tagSrc === TAG_SRC.github" />

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
          <svg-icon name="share" class="text-xs text-[#76d0a3]" />
        </h1>
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
import { BRAND, BRAND_URI, TAG_SRC } from '@/constants';

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

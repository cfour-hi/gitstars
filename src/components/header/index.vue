<template>
  <header
    class="flex h-16 flex-none items-center justify-between gap-2 border-b border-solid border-b-gray-300 bg-white px-4"
  >
    <div class="flex items-center">
      <a :href="userinfo.html_url" rel="noopener noreferrer">
        <img
          :src="userinfo.avatar_url"
          :alt="$t('userAvatar', { username })"
          class="w-10 rounded-full"
        />
      </a>

      <a
        :href="`${userinfo.html_url}?tab=repositories`"
        rel="noopener noreferrer"
        class="ml-3 text-xl font-bold text-[#948aec] hover:underline"
      >
        <h2>
          {{ $t('userTitle', { username }) }}
          <svg-icon name="share" class="text-sm" />
        </h2>
      </a>
    </div>

    <span class="flex-auto"></span>

    <button
      type="button"
      class="inline-flex cursor-pointer items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#948aec]"
      :aria-label="$t('languageToggle')"
      :title="$t('languageToggle')"
      @click="handleChangeLang"
    >
      <svg-icon name="translate" class="text-xl" />
      <span>· </span>
      <span class="text-sm">{{ userStore.lang === 'zh' ? '中' : 'En' }}</span>
    </button>

    <span class="mt-0.5 h-4 w-px bg-gray-400"></span>

    <a :href="BRAND_URI" rel="noopener noreferrer">
      <svg-icon name="github" class="text-xl hover:opacity-50" />
    </a>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { BRAND_URI } from '@/constants';

const userStore = useUserStore();
const { userinfo } = storeToRefs(userStore);

// GitHub 用户的 name 可以为空，此时回退到 login，避免出现 "null 的星标存储库"
const username = computed(
  () => userinfo.value.name || userinfo.value.login || '',
);

const handleChangeLang = () => {
  const newLang = userStore.lang === 'zh' ? 'en' : 'zh';
  userStore.$patch({ lang: newLang });
};
</script>

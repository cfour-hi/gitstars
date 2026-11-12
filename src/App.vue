<template>
  <template v-if="userStore.token">
    <Sidebar />
    <div class="flex flex-auto flex-col" style="width: calc(100% - 18rem)">
      <Header />
      <div class="flex" style="height: calc(100% - 4rem)">
        <SidebarRepository />
        <RepositoryContent />
      </div>
    </div>
  </template>
  <Unauth v-else />
</template>

<script setup>
import { watch } from 'vue';
import Sidebar from '@/components/sidebar/index.vue';
import Header from '@/components/header/index.vue';
import SidebarRepository from '@/components/sidebar-repository/index.vue';
import RepositoryContent from '@/components/repository-content/index.vue';
import Unauth from '@/components/unauth.vue';
import { useUserStore } from '@/store/user';
import { useI18n } from 'vue-i18n';
import { LANG_KEY } from '@/constants';

const userStore = useUserStore();
const { locale } = useI18n();

watch(
  () => userStore.lang,
  (lang) => {
    locale.value = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  },
  { immediate: true },
);
</script>

<style src="./styles/app.css"></style>

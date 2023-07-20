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
import Sidebar from '@/components/sidebar/index.vue';
import Header from '@/components/header/index.vue';
import SidebarRepository from '@/components/sidebar-repository/index.vue';
import RepositoryContent from '@/components/repository-content/index.vue';
import Unauth from '@/components/unauth.vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
</script>

<style src="./styles/app.css"></style>
<style src="./styles/microtip.css"></style>

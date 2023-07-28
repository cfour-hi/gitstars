<template>
  <header
    class="flex h-16 flex-none items-center justify-between border-b border-solid border-b-gray-300 bg-white px-4"
  >
    <div class="flex items-center">
      <a :href="userinfo.html_url" rel="noopener noreferrer">
        <img :src="userinfo.avatar_url" alt="" class="w-10 rounded-full" />
      </a>

      <a
        :href="`${userinfo.html_url}?tab=repositories`"
        rel="noopener noreferrer"
        class="ml-3 text-xl font-bold text-[#948aec] hover:underline"
      >
        <h2>
          {{ userinfo.name }}'s Starred Repositories
          <svg-icon name="share" class="text-sm" />
        </h2>
      </a>
    </div>

    <a :href="BRAND_URI">
      <svg-icon name="github" class="text-2xl hover:opacity-50" />
    </a>
  </header>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { BRAND_URI } from '@/constants';

const { userinfo } = useUserStore();
</script>

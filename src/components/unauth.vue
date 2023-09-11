<template>
  <div class="unauth h-full w-full">
    <div class="wrapper h-full">
      <div
        class="absolute left-1/2 top-1/2 w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#000c] py-10"
      >
        <h1
          class="brand-text mb-12 flex justify-center font-['gitstars'] text-7xl font-bold uppercase text-[#948aec]"
        >
          <svg-icon name="logo" class="mr-1" />
          {{ BRAND }}
        </h1>

        <a
          class="mx-auto flex w-56 items-center justify-center rounded-md bg-gray-100 px-5 py-3 text-center text-base hover:bg-gray-200 hover:underline"
          :href="authURL"
          target="_self"
        >
          <svg-icon name="github" class="mr-2 text-xl" />
          <span>GitHub APP 授权登录</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BRAND } from '@/constants';

const authURL = `https://github.com/login/oauth/authorize?client_id=${
  import.meta.env.VITE_GITSTARS_CLIENT_ID
}&redirect_uri=${location.origin}&scope=public_repo`;
</script>

<style scoped>
.unauth {
  background-image: linear-gradient(45deg, #948aec 0%, #76d0a3 100%);
}

.wrapper {
  background: url(/example-your-stars.png) no-repeat center/contain;
}
</style>

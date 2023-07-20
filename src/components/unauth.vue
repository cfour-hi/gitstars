<template>
  <div class="unauth h-full w-full">
    <div
      class="absolute left-1/2 top-1/2 w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#000c] py-10"
    >
      <h1
        class="brand-text mb-12 flex justify-center font-['gitstars'] text-7xl font-bold uppercase text-[#948aec]"
      >
        <svg-icon name="logo" class="mr-1" />
        {{ BRAND }}
      </h1>
      <!-- <div class="leading-loose">
        <p>Gitstars 是一个 Github 仓库分类工具</p>
        <p>能够通过 topic 和 language 对仓库进行分类</p>
        <p>帮助使用者快速找到自己 star 的仓库</p>
      </div> -->
      <a class="block text-center" :href="authURL" target="_self">
        <button
          class="cursor-pointer rounded bg-[#948aec] p-3 text-base text-white hover:bg-[#948aeccc]"
        >
          GitHub APP 授权登录
        </button>
      </a>
    </div>
  </div>
</template>

<script setup>
import { BRAND } from '@/constants';

const authURL = `https://github.com/login/oauth/authorize?client_id=${
  import.meta.env.VITE_GITSTARS_CLIENT_ID
}&redirect_uri=${location.origin}&scope=gist,repo`;
</script>

<style lang="scss" scoped>
.unauth {
  background: {
    image: url(/example-gitstars.png);
    size: contain;
    repeat: no-repeat;
    position: center;
  }
}
</style>

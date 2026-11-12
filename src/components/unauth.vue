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
          class="mx-auto flex w-72 items-center justify-center rounded-md bg-gray-100 px-5 py-3 text-center text-base hover:bg-gray-200 hover:underline"
          :href="authURL"
          target="_self"
          rel="noopener noreferrer"
        >
          <svg-icon name="github" class="mr-2 text-xl" />
          <span>{{ $t('loginTip') }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BRAND, OAUTH_STATE_KEY } from '@/constants';

// GitHub OAuth 的 state，用于防止登录 CSRF
const createState = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// 只读取用户公开的信息（/user 与公开的 starred 仓库），无需 public_repo 写权限
const authURL = (() => {
  const url = new URL('https://github.com/login/oauth/authorize');
  const clientId = import.meta.env.VITE_GITSTARS_CLIENT_ID;
  const state = createState();

  sessionStorage.setItem(OAUTH_STATE_KEY, state);

  if (clientId) url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', location.origin);
  url.searchParams.set('state', state);

  return url.toString();
})();
</script>

<style scoped>
.unauth {
  background-image: linear-gradient(45deg, #948aec 0%, #76d0a3 100%);
}

.wrapper {
  background: url(/example-your-stars.webp) no-repeat center/contain;
}
</style>

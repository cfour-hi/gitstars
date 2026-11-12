import { defineStore } from 'pinia';
import { LOCAL_KEY_USERINFO } from '@/constants';
import { getUserInfo } from '@/server/github';

function readCachedUserinfo() {
  try {
    const cached = localStorage.getItem(LOCAL_KEY_USERINFO);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to read cached user info:', error);
    localStorage.removeItem(LOCAL_KEY_USERINFO);
    return null;
  }
}

export const useUserStore = defineStore('userinfo', {
  state: () => ({
    token: '',
    userinfo: {},
    htmlFontSize: 16,
    lang: 'zh',
  }),

  actions: {
    async resolveUserinfo() {
      // 先使用缓存保证首屏速度，再请求最新数据。
      // 只读缓存会导致切换 GitHub 账号后仍显示上一个账号的信息。
      const cachedUserinfo = readCachedUserinfo();
      if (cachedUserinfo) Object.assign(this.userinfo, cachedUserinfo);

      try {
        const userinfo = await getUserInfo();
        localStorage.setItem(LOCAL_KEY_USERINFO, JSON.stringify(userinfo));
        Object.assign(this.userinfo, userinfo);
      } catch (error) {
        if (!cachedUserinfo) throw error;
        console.error('Failed to refresh user info, using cache:', error);
      }
    },
  },
});

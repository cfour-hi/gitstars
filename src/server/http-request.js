import axios from 'axios';
import { useUserStore } from '@/store/user';
import { TOKEN_KEY, LOCAL_KEY_USERINFO, STARRED_REPOS } from '@/constants';

// httpRequestGitstars

export const httpRequestGitstars = axios.create({
  timeout: 20_000,
});

httpRequestGitstars.interceptors.response.use((res) => res.data);

// httpRequestGithub

export const httpRequestGithub = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 20_000,
  headers: {
    Accept: 'application/vnd.github+json',
  },
});

httpRequestGithub.interceptors.request.use((config) => {
  const userStore = useUserStore();
  config.headers.Authorization = `Bearer ${userStore.token}`;
  return config;
});

httpRequestGithub.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // access_token 失效
    // 只清理 Gitstars 自己的数据，避免误删同一域名下其他应用的数据
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LOCAL_KEY_USERINFO);
      localStorage.removeItem(STARRED_REPOS);
      location.reload();
    }

    return Promise.reject(err);
  },
);

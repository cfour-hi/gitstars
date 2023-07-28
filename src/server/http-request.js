import axios from 'axios';
import { useUserStore } from '@/store/user';

// httpRequestGitstars

export const httpRequestGitstars = axios.create();

httpRequestGitstars.interceptors.response.use((res) => res.data);

// httpRequestGithub

export const httpRequestGithub = axios.create({
  baseURL: 'https://api.github.com',
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
    if (err.response.status === 401) {
      localStorage.clear();
      location.reload();
    }

    return Promise.reject(err);
  },
);

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
  config.headers.Authorization = `token ${userStore.token}`;
  return config;
});
httpRequestGithub.interceptors.response.use((res) => res.data);

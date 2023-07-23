import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';
import { loadEnv } from 'vite';

const envLocal = loadEnv(process.env.NODE_ENV, process.cwd());
const isDev = process.env.NODE_ENV === 'development';

const toConfig = () => {
  const config = {
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/svg-icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };

  if (isDev) {
    config.server = {
      https: {
        key: './cert/localhost.key',
        cert: './cert/localhost.crt',
      },
      host: true,
      port: '30000',
      proxy: {
        '/api': {
          target: envLocal.VITE_API_PROXY,
          changeOrigin: true,
        },
      },
    };
  }

  return config;
};

// https://vitejs.dev/config/
export default defineConfig(toConfig());

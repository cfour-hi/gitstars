import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const certificateDirectory = path.resolve(
    process.cwd(),
    env.GITSTARS_CERT_DIR || '.certs',
  );
  const proxyTarget = env.VITE_API_PROXY;

  return {
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
    server: isDev
      ? {
          https: {
            key: path.join(certificateDirectory, 'localhost-key.pem'),
            cert: path.join(certificateDirectory, 'localhost.pem'),
          },
          // 默认只监听 localhost，避免开发服务器暴露到局域网；需要时可用 `vite --host` 覆盖
          port: 30000,
          ...(proxyTarget
            ? {
                proxy: {
                  '/api': {
                    target: proxyTarget,
                    changeOrigin: true,
                    // 允许代理到使用 mkcert 自签证书的本地 Docker 实例
                    secure: false,
                  },
                },
              }
            : {}),
        }
      : undefined,
  };
});

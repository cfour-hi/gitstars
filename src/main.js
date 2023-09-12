import 'virtual:svg-icons-register';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { TOKEN_KEY } from '@/constants';
import { getToken } from '@/server/gitstars';
import { useUserStore } from '@/store/user';
import SvgIcon from '@/components/svg-icon.vue';
import VueVirtualScroller from 'vue-virtual-scroller';
import { throttle } from 'lodash';

function onResize() {
  let fontSize = window.innerWidth / 100;
  if (fontSize < 12) {
    fontSize = 12;
  } else if (fontSize > 16) {
    fontSize = 16;
  }
  const userStore = useUserStore();
  userStore.$patch({ htmlFontSize: fontSize });
  document.scrollingElement.style.fontSize = `${fontSize}px`;
}

function removeURLCode() {
  let href = location.href.replace(/code=[^&]+/, '');
  if (href[href.length - 1] === '?') href = href.slice(0, -1);
  history.replaceState({}, null, href);
}

async function resolveToken() {
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get('code');
  if (!code) return;

  removeURLCode();

  const res = await getToken(code).catch((err) => {
    onAppError(err);
  });

  if (!res.access_token) {
    onAppError({ message: `${res.error}. ${res.error_description}` });
    throw new Error(res);
  }

  localStorage.setItem(TOKEN_KEY, res.access_token);

  const userStore = useUserStore();
  userStore.$patch({ token: res.access_token });
  await userStore.resolveUserinfo();
}

async function initApp() {
  const app = createApp(App);
  app.use(createPinia());
  app.use(VueVirtualScroller);
  app.component(SvgIcon.name, SvgIcon);

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    const userStore = useUserStore();
    userStore.$patch({ token });
    await userStore.resolveUserinfo();
  } else {
    await resolveToken();
  }

  app.mount('#app');

  window.addEventListener('resize', throttle(onResize, 300));
  onResize();
}

initApp();

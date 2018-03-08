import Vue from 'vue'
import VueI18n from 'vue-i18n'
import lang from '@/lang'
import appConfig from '@/config'

Vue.use(VueI18n)

export default new VueI18n({
  locale: window.localStorage.getItem(appConfig.i18nLocaleKey) || 'cn',
  fallbackLocale: 'en',
  messages: lang,
})

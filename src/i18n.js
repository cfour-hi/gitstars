import Vue from 'vue'
import VueI18n from 'vue-i18n'
import lang from './lang'
import config from './config'

Vue.use(VueI18n)

const locale = window.localStorage.getItem(config.i18nLocaleKey) || 'cn'

export default new VueI18n({
  locale,
  fallbackLocale: 'en',
  messages: lang,
})

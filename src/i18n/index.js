import { createI18n } from 'vue-i18n';
import zh from './zh';
import en from './en';

export const createI18nByLocale = (locale = 'zh') =>
  createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: { zh, en },
  });

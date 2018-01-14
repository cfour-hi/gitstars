import base from './base'
import cn from './cn'
import en from './en'

const i18n = { cn, en }
Object.values(i18n).forEach(language => Object.assign(language, base))

export default i18n

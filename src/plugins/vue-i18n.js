// i18n.js
import { createI18n } from 'vue-i18n'
import zh from '@/locales/CHT.json'
import en from '@/locales/ENG.json'

export default createI18n({
    legacy: false,
    locale: 'zh', // 預設語言
    fallbackLocale: 'en',
    messages: {
        zh,
        en
    }
});


import messages from '@intlify/unplugin-vue-i18n/messages';
import { get } from '@vueuse/core';
import type { Plugin } from 'vue';
import { createI18n } from 'vue-i18n';

const availableLocales = Object.keys(messages ?? {});

// 将浏览器语言映射到最接近的支持语言
const localeAliases: Record<string, string> = {
  'zh-cn': 'zh',
  'zh-sg': 'zh',
  'zh-hans': 'zh',
  'zh-hant': 'zh',
  'zh-tw': 'zh',
  'zh-hk': 'zh',
  'zh-mo': 'zh',
  'pt-br': 'pt',
  'pt-pt': 'pt',
};

/**
 * 检测浏览器语言并自动设置为最接近的支持语言。
 * 优先级:用户已保存的语言 > 浏览器语言 > 英文。
 */
export function detectLocale(): string {
  try {
    // 1. 用户显式选择过的语言优先
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && availableLocales.includes(storedLocale)) {
      return storedLocale;
    }

    // 2. 根据浏览器语言自动检测
    const browserLocale = navigator.language.toLowerCase();

    const alias = localeAliases[browserLocale];
    if (alias) {
      return alias;
    }

    const exactMatch = availableLocales.find(locale => browserLocale === locale.toLowerCase());
    if (exactMatch) {
      return exactMatch;
    }

    const langCode = browserLocale.split('-')[0];
    const langMatch = availableLocales.find(locale => langCode === locale.toLowerCase());
    if (langMatch) {
      return langMatch;
    }
  }
  catch {
    // localStorage 不可用时回退到英文
  }

  return 'en';
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages,
});

export const i18nPlugin: Plugin = {
  install: (app) => {
    app.use(i18n);
  },
};

export const translate = function (localeKey: string) {
  const hasKey = i18n.global.te(localeKey, get(i18n.global.locale));
  return hasKey ? i18n.global.t(localeKey) : localeKey;
};

<script setup lang="ts">
import { detectLocale } from '@/plugins/i18n.plugin';

const { availableLocales, locale, t } = useI18n();

const localesLong: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  no: 'Norwegian',
  pt: 'Português',
  ru: 'Русский',
  uk: 'Українська',
  zh: '中文',
  vi: 'Tiếng Việt',
};

const storedLocale = localStorage.getItem('locale');
const hasStoredLocale = !!storedLocale && availableLocales.includes(storedLocale);
// 已保存过语言则显示该语言,否则显示"自动"
const selectedLocale = ref(hasStoredLocale ? storedLocale! : 'auto');

const localeOptions = computed(() => [
  { label: 'Auto (自动)', value: 'auto' },
  ...availableLocales.map(locale => ({
    label: localesLong[locale] ?? locale,
    value: locale,
  })),
]);

// 是否处于"自动检测"模式(未显式选择过语言)
function isAutoMode() {
  return localStorage.getItem('locale') === null;
}

// 跟随语言实际变化(同步多个选择器实例)
watch(locale, (value) => {
  if (!isAutoMode()) {
    selectedLocale.value = value;
  }
});

watch(selectedLocale, (value) => {
  if (value === 'auto') {
    // 自动模式:不写入存储,保持每次访问都按浏览器语言重新检测
    localStorage.removeItem('locale');
    locale.value = detectLocale();
  }
  else if (value !== locale.value) {
    // 手动选择:持久化用户偏好
    localStorage.setItem('locale', value);
    locale.value = value;
  }
});
</script>

<template>
  <c-select
    v-model:value="selectedLocale"
    :options="localeOptions"
    :placeholder="t('home.selectLanguage')"
    w-100px
  />
</template>

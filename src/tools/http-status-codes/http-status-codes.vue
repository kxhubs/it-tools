<script setup lang="ts">
import { codesByCategories } from './http-status-codes.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';

const { t } = useI18n();
const search = ref('');

const categoryKeys: Record<string, string> = {
  '1xx informational response': 'category1xx',
  '2xx success': 'category2xx',
  '3xx redirection': 'category3xx',
  '4xx client error': 'category4xx',
  '5xx server error': 'category5xx',
};

const translateCategory = (category: string) => t(`tools.http-status-codes.${categoryKeys[category]}`);
const translateCode = (code: number) => ({
  name: t(`tools.http-status-codes.code${code}.name`),
  description: t(`tools.http-status-codes.code${code}.description`),
});

// 响应式翻译数据:语言切换时自动更新(搜索与展示共用)
const translatedCodes = computed(() =>
  codesByCategories.flatMap(({ codes, category }) =>
    codes.map(code => ({
      code: code.code,
      ...translateCode(code.code),
      category: translateCategory(category),
      type: code.type,
    })),
  ),
);

const { searchResult } = useFuzzySearch({
  search,
  data: translatedCodes,
  options: {
    keys: [{ name: 'code', weight: 3 }, { name: 'name', weight: 2 }, 'description', 'category'],
  },
});

const codesByCategoryFiltered = computed(() => {
  if (!search.value) {
    return codesByCategories.map(({ codes, category }) => ({
      category: translateCategory(category),
      codes: codes.map(code => ({ code: code.code, type: code.type, ...translateCode(code.code) })),
    }));
  }

  return [{ category: t('tools.http-status-codes.searchResults'), codes: searchResult.value }];
});
</script>

<template>
  <div>
    <c-input-text
      v-model:value="search"
      :placeholder="t('tools.http-status-codes.searchPlaceholder')"
      autofocus raw-text mb-10
    />

    <div v-for="{ codes, category } of codesByCategoryFiltered" :key="category" mb-8>
      <div mb-2 text-xl>
        {{ category }}
      </div>

      <c-card v-for="{ code, description, name, type } of codes" :key="code" mb-2>
        <div text-lg font-bold>
          {{ code }} {{ name }}
        </div>
        <div op-70>
          {{ description }} {{ type !== 'HTTP' ? `${t('tools.http-status-codes.forType')} ${type}.` : '' }}
        </div>
      </c-card>
    </div>
  </div>
</template>

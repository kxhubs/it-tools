<script setup lang="ts">
import {
  chineseSimplifiedWordList,
  chineseTraditionalWordList,
  czechWordList,
  englishWordList,
  entropyToMnemonic,
  frenchWordList,
  generateEntropy,
  italianWordList,
  japaneseWordList,
  koreanWordList,
  mnemonicToEntropy,
  portugueseWordList,
  spanishWordList,
} from '@it-tools/bip39';
import { Copy, Refresh } from '@vicons/tabler';

import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const languages = {
  'English': englishWordList,
  'Chinese simplified': chineseSimplifiedWordList,
  'Chinese traditional': chineseTraditionalWordList,
  'Czech': czechWordList,
  'French': frenchWordList,
  'Italian': italianWordList,
  'Japanese': japaneseWordList,
  'Korean': koreanWordList,
  'Portuguese': portugueseWordList,
  'Spanish': spanishWordList,
};

const languageLabels: Record<string, string> = {
  'English': t('tools.bip39-generator.languageEnglish'),
  'Chinese simplified': t('tools.bip39-generator.languageChineseSimplified'),
  'Chinese traditional': t('tools.bip39-generator.languageChineseTraditional'),
  'Czech': t('tools.bip39-generator.languageCzech'),
  'French': t('tools.bip39-generator.languageFrench'),
  'Italian': t('tools.bip39-generator.languageItalian'),
  'Japanese': t('tools.bip39-generator.languageJapanese'),
  'Korean': t('tools.bip39-generator.languageKorean'),
  'Portuguese': t('tools.bip39-generator.languagePortuguese'),
  'Spanish': t('tools.bip39-generator.languageSpanish'),
};

const languageOptions = computed(() => Object.keys(languages).map(key => ({
  value: key,
  label: languageLabels[key],
})));

const entropy = ref(generateEntropy());
const passphraseInput = ref('');

const language = ref<keyof typeof languages>('English');
const passphrase = computed({
  get() {
    return withDefaultOnError(() => entropyToMnemonic(entropy.value, languages[language.value]), passphraseInput.value);
  },
  set(value: string) {
    passphraseInput.value = value;
    entropy.value = withDefaultOnError(() => mnemonicToEntropy(value, languages[language.value]), '');
  },
});

const entropyValidation = useValidation({
  source: entropy,
  rules: [
    {
      validator: value => value === '' || (value.length <= 32 && value.length >= 16 && value.length % 4 === 0),
      message: t('tools.bip39-generator.entropyLengthError'),
    },
    {
      validator: value => /^[a-fA-F0-9]*$/.test(value),
      message: t('tools.bip39-generator.entropyHexError'),
    },
  ],
});

const mnemonicValidation = useValidation({
  source: passphrase,
  rules: [
    {
      validator: value => isNotThrowing(() => mnemonicToEntropy(value, languages[language.value])),
      message: t('tools.bip39-generator.invalidMnemonic'),
    },
  ],
});

function refreshEntropy() {
  entropy.value = generateEntropy();
}

const { copy: copyEntropy } = useCopy({ source: entropy, text: t('tools.bip39-generator.copiedEntropy') });
const { copy: copyPassphrase } = useCopy({ source: passphrase, text: t('tools.bip39-generator.copiedPassphrase') });
</script>

<template>
  <div>
    <n-grid cols="3" x-gap="12">
      <n-gi span="1">
        <c-select
          v-model:value="language"
          searchable
          :label="t('tools.bip39-generator.languageLabel')"
          :options="languageOptions"
        />
      </n-gi>
      <n-gi span="2">
        <n-form-item
          :label="t('tools.bip39-generator.entropyLabel')"
          :feedback="entropyValidation.message"
          :validation-status="entropyValidation.status"
        >
          <n-input-group>
            <c-input-text v-model:value="entropy" :placeholder="t('tools.bip39-generator.entropyPlaceholder')" />

            <c-button @click="refreshEntropy()">
              <n-icon size="22">
                <Refresh />
              </n-icon>
            </c-button>
            <c-button @click="copyEntropy()">
              <n-icon size="22">
                <Copy />
              </n-icon>
            </c-button>
          </n-input-group>
        </n-form-item>
      </n-gi>
    </n-grid>
    <n-form-item
      :label="t('tools.bip39-generator.passphraseLabel')"
      :feedback="mnemonicValidation.message"
      :validation-status="mnemonicValidation.status"
    >
      <n-input-group>
        <c-input-text v-model:value="passphrase" :placeholder="t('tools.bip39-generator.passphrasePlaceholder')" raw-text />

        <c-button @click="copyPassphrase()">
          <n-icon size="22" :component="Copy" />
        </c-button>
      </n-input-group>
    </n-form-item>
  </div>
</template>

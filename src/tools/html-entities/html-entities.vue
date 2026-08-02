<script setup lang="ts">
import { escape, unescape } from 'lodash';

import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const escapeInput = ref('<title>IT 工具</title>');
const escapeOutput = computed(() => escape(escapeInput.value));
const { copy: copyEscaped } = useCopy({ source: escapeOutput });

const unescapeInput = ref('&lt;title&gt;IT Tool&lt;/title&gt;');
const unescapeOutput = computed(() => unescape(unescapeInput.value));
const { copy: copyUnescaped } = useCopy({ source: unescapeOutput });
</script>

<template>
  <c-card :title="t('tools.html-entities.escapeTitle')">
    <n-form-item :label="t('tools.html-entities.inputLabel')">
      <c-input-text
        v-model:value="escapeInput"
        multiline
        :placeholder="t('tools.html-entities.inputPlaceholder')"
        rows="3"
        autosize
        raw-text
      />
    </n-form-item>

    <n-form-item :label="t('tools.html-entities.outputLabel')">
      <c-input-text
        multiline
        readonly
        :placeholder="t('tools.html-entities.outputPlaceholder')"
        :value="escapeOutput"
        rows="3"
        autosize
      />
    </n-form-item>

    <div flex justify-center>
      <c-button @click="copyEscaped()">
        {{ t('tools.html-entities.copy') }}
      </c-button>
    </div>
  </c-card>
  <c-card :title="t('tools.html-entities.unescapeTitle')">
    <n-form-item :label="t('tools.html-entities.unescapeInputLabel')">
      <c-input-text
        v-model:value="unescapeInput"
        multiline
        :placeholder="t('tools.html-entities.unescapeInputPlaceholder')"
        rows="3"
        autosize
        raw-text
      />
    </n-form-item>

    <n-form-item :label="t('tools.html-entities.unescapeOutputLabel')">
      <c-input-text
        :value="unescapeOutput"
        multiline
        readonly
        :placeholder="t('tools.html-entities.unescapeOutputPlaceholder')"
        rows="3"
        autosize
      />
    </n-form-item>

    <div flex justify-center>
      <c-button @click="copyUnescaped()">
        {{ t('tools.html-entities.copy') }}
      </c-button>
    </div>
  </c-card>
</template>

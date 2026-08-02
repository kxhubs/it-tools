<script setup lang="ts">
import { convertTextToUtf8Binary, convertUtf8BinaryToText } from './text-to-binary.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useCopy } from '@/composable/copy';
import { isNotThrowing } from '@/utils/boolean';

const inputText = ref('');
const binaryFromText = computed(() => convertTextToUtf8Binary(inputText.value));
const { copy: copyBinary } = useCopy({ source: binaryFromText });

const inputBinary = ref('');
const textFromBinary = computed(() => withDefaultOnError(() => convertUtf8BinaryToText(inputBinary.value), ''));
const { t } = useI18n();
const inputBinaryValidationRules = [
  {
    validator: (value: string) => isNotThrowing(() => convertUtf8BinaryToText(value)),
    message: t('tools.text-to-binary.binaryValidationMessage'),
  },
];
const { copy: copyText } = useCopy({ source: textFromBinary });
</script>

<template>
  <c-card :title="t('tools.text-to-binary.textToBinaryTitle')">
    <c-input-text
      v-model:value="inputText"

      :placeholder="t('tools.text-to-binary.textPlaceholder')"
      :label="t('tools.text-to-binary.textInputLabel')"

      autosize autofocus raw-text multiline
      test-id="text-to-binary-input"
    />
    <c-input-text
      v-model:value="binaryFromText"
      :label="t('tools.text-to-binary.binaryOutputLabel')"
      multiline
      raw-text
      readonly
      mt-2
      :placeholder="t('tools.text-to-binary.binaryOutputPlaceholder')"
      test-id="text-to-binary-output"
    />
    <div mt-2 flex justify-center>
      <c-button :disabled="!binaryFromText" @click="copyBinary()">
        {{ t('tools.text-to-binary.copyBinary') }}
      </c-button>
    </div>
  </c-card>

  <c-card :title="t('tools.text-to-binary.binaryToTextTitle')">
    <c-input-text
      v-model:value="inputBinary"
      multiline
      :placeholder="t('tools.text-to-binary.binaryPlaceholder')"
      :label="t('tools.text-to-binary.binaryInputLabel')"
      autosize
      raw-text
      :validation-rules="inputBinaryValidationRules"
      test-id="binary-to-text-input"
    />
    <c-input-text
      v-model:value="textFromBinary"
      :label="t('tools.text-to-binary.textOutputLabel')"
      multiline
      raw-text
      readonly
      mt-2
      :placeholder="t('tools.text-to-binary.textOutputPlaceholder')"
      test-id="binary-to-text-output"
    />
    <div mt-2 flex justify-center>
      <c-button :disabled="!textFromBinary" @click="copyText()">
        {{ t('tools.text-to-binary.copyText') }}
      </c-button>
    </div>
  </c-card>
</template>

<script setup lang="ts">
import { types as extensionToMimeType, extensions as mimeTypeToExtension } from 'mime-types';

const { t } = useI18n();

const mimeInfos = Object.entries(mimeTypeToExtension).map(([mimeType, extensions]) => ({ mimeType, extensions }));

const mimeToExtensionsOptions = Object.keys(mimeTypeToExtension).map(label => ({ label, value: label }));
const selectedMimeType = ref(undefined);

const extensionsFound = computed(() => (selectedMimeType.value ? mimeTypeToExtension[selectedMimeType.value] : []));

const extensionToMimeTypeOptions = Object.keys(extensionToMimeType).map((label) => {
  const extension = `.${label}`;

  return { label: extension, value: label };
});
const selectedExtension = ref(undefined);

const mimeTypeFound = computed(() => (selectedExtension.value ? extensionToMimeType[selectedExtension.value] : []));
</script>

<template>
  <c-card>
    <n-h2 style="margin-bottom: 0">
      {{ t('tools.mime-types.mimeTypeToExtensionTitle') }}
    </n-h2>
    <div style="opacity: 0.8">
      {{ t('tools.mime-types.mimeTypeToExtensionDescription') }}
    </div>
    <c-select
      v-model:value="selectedMimeType"
      searchable
      my-4
      :options="mimeToExtensionsOptions"
      :placeholder="t('tools.mime-types.selectMimeTypePlaceholder')"
    />

    <div v-if="extensionsFound.length > 0">
      {{ t('tools.mime-types.extensionsOfMimeType', { mimeType: selectedMimeType }) }}
      <div style="margin-top: 10px">
        <n-tag
          v-for="extension of extensionsFound"
          :key="extension"
          round
          :bordered="false"
          type="primary"
          style="margin-right: 10px"
        >
          .{{ extension }}
        </n-tag>
      </div>
    </div>
  </c-card>

  <c-card>
    <n-h2 style="margin-bottom: 0">
      {{ t('tools.mime-types.extensionToMimeTypeTitle') }}
    </n-h2>
    <div style="opacity: 0.8">
      {{ t('tools.mime-types.extensionToMimeTypeDescription') }}
    </div>
    <c-select
      v-model:value="selectedExtension"
      searchable
      my-4
      :options="extensionToMimeTypeOptions"
      :placeholder="t('tools.mime-types.selectMimeTypePlaceholder')"
    />

    <div v-if="selectedExtension">
      {{ t('tools.mime-types.mimeTypeOfExtension', { extension: selectedExtension }) }}
      <div style="margin-top: 10px">
        <n-tag round :bordered="false" type="primary" style="margin-right: 10px">
          {{ mimeTypeFound }}
        </n-tag>
      </div>
    </div>
  </c-card>

  <div>
    <n-table>
      <thead>
        <tr>
          <th>{{ t('tools.mime-types.mimeTypes') }}</th>
          <th>{{ t('tools.mime-types.extensions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ mimeType, extensions } of mimeInfos" :key="mimeType">
          <td>{{ mimeType }}</td>
          <td>
            <n-tag v-for="extension of extensions" :key="extension" round :bordered="false" style="margin-right: 10px">
              .{{ extension }}
            </n-tag>
          </td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

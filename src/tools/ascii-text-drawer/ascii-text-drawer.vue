<script setup lang="ts">
import figlet from 'figlet';
import type { FigletOptions, FontName } from 'figlet';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const { t } = useI18n();

const input = ref('Ascii ART');
const font = useStorage('ascii-text-drawer:font', 'Standard');
const width = useStorage('ascii-text-drawer:width', 80);
const output = ref('');
const errored = ref(false);
const processing = ref(false);

const fontModulePrefix = '/node_modules/figlet/importable-fonts/';
const fontModules = import.meta.glob<{ default: string }>('/node_modules/figlet/importable-fonts/*.js');
const fonts = Object.keys(fontModules)
  .map(path => path.slice(fontModulePrefix.length, -3))
  .sort((a, b) => a.localeCompare(b));
const loadedFonts = new Set<string>();
let generationId = 0;

async function loadFont(fontName: string) {
  if (loadedFonts.has(fontName)) {
    return;
  }

  const loadFontModule = fontModules[`${fontModulePrefix}${fontName}.js`];
  if (!loadFontModule) {
    throw new Error(`Unknown Figlet font: ${fontName}`);
  }

  const { default: fontData } = await loadFontModule();
  figlet.parseFont(fontName as FontName, fontData);
  loadedFonts.add(fontName);
}

watch(
  [input, font, width],
  async ([currentInput, currentFont, currentWidth]) => {
    const currentGenerationId = ++generationId;
    processing.value = true;

    try {
      const validFont = fontModules[`${fontModulePrefix}${currentFont}.js`] ? currentFont : 'Standard';
      if (validFont !== currentFont) {
        font.value = validFont;
        return;
      }

      await loadFont(validFont);
      const options: FigletOptions = {
        font: validFont as FontName,
        width: currentWidth,
        whitespaceBreak: true,
      };
      const generatedOutput = await figlet.text(currentInput, options);

      if (currentGenerationId === generationId) {
        output.value = generatedOutput;
        errored.value = false;
      }
    }
    catch {
      if (currentGenerationId === generationId) {
        errored.value = true;
      }
    }
    finally {
      if (currentGenerationId === generationId) {
        processing.value = false;
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <c-card style="max-width: 600px;">
    <c-input-text
      v-model:value="input"
      :label="t('tools.ascii-text-drawer.inputLabel')"
      :placeholder="t('tools.ascii-text-drawer.inputPlaceholder')"
      raw-text
      multiline
      rows="4"
    />

    <n-divider />

    <n-grid cols="4" x-gap="12" w-full>
      <n-gi span="2">
        <c-select
          v-model:value="font"
          label-position="top"
          :label="t('tools.ascii-text-drawer.fontLabel')"
          :options="fonts"
          searchable="true"
          :placeholder="t('tools.ascii-text-drawer.fontPlaceholder')"
        />
      </n-gi>
      <n-gi span="2">
        <n-form-item :label="t('tools.ascii-text-drawer.widthLabel')" label-placement="top" label-width="100" :show-feedback="false">
          <n-input-number v-model:value="width" min="0" max="10000" w-full :placeholder="t('tools.ascii-text-drawer.widthPlaceholder')" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-divider />

    <div v-if="processing" flex items-center justify-center>
      <n-spin size="medium" />
      <span class="ml-2">{{ t('tools.ascii-text-drawer.loadingFont') }}</span>
    </div>

    <c-alert v-if="errored" mt-1 text-center type="error">
      {{ t('tools.ascii-text-drawer.errorMessage') }}
    </c-alert>

    <n-form-item v-if="!processing && !errored" :label="t('tools.ascii-text-drawer.outputLabel')">
      <TextareaCopyable
        :value="output"
        mb-1 mt-1
        copy-placement="outside"
      />
    </n-form-item>
  </c-card>
</template>

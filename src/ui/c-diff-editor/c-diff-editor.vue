<script setup lang="ts">
import type * as Monaco from 'monaco-editor';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{ options?: Monaco.editor.IDiffEditorOptions }>(), { options: () => ({}) });
const { options } = toRefs(props);

const editorContainer = ref<HTMLElement | null>(null);
let monaco: typeof Monaco | undefined;
let editor: Monaco.editor.IStandaloneDiffEditor | null = null;

const styleStore = useStyleStore();

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monaco?.editor.setTheme(isDarkTheme ? 'it-tools-dark' : 'it-tools-light'),
  { immediate: true },
);

watch(
  () => options.value,
  options => editor?.updateOptions(options),
  { immediate: true, deep: true },
);

useResizeObserver(editorContainer, () => {
  editor?.layout();
});

onMounted(async () => {
  if (!editorContainer.value) {
    return;
  }

  monaco = await import('monaco-editor');
  monaco.editor.defineTheme('it-tools-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#00000000',
    },
  });
  monaco.editor.defineTheme('it-tools-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#00000000',
    },
  });
  monaco.editor.setTheme(styleStore.isDarkTheme ? 'it-tools-dark' : 'it-tools-light');

  editor = monaco.editor.createDiffEditor(editorContainer.value, {
    originalEditable: true,
    minimap: {
      enabled: false,
    },
  });

  editor.setModel({
    original: monaco.editor.createModel('original text', 'txt'),
    modified: monaco.editor.createModel('modified text', 'txt'),
  });
});

onBeforeUnmount(() => {
  editor?.getModel()?.original.dispose();
  editor?.getModel()?.modified.dispose();
  editor?.dispose();
});
</script>

<template>
  <div ref="editorContainer" h-600px />
</template>

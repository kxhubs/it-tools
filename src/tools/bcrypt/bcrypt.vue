<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import { type BcryptRequest, InvalidatedError, bcryptWithProgressUpdates } from './bcrypt.models';
import { useCopy } from '@/composable/copy';

const themeVars = useThemeVars();

const { t } = useI18n();

interface ExecutionState<T> {
  result: T | null
  percentage: number
  error: string | null
  timeTakenMs: number | null
}

const blankState = () => ({ result: null, percentage: 0, error: null, timeTakenMs: null });

async function exec<Result>(
  request: BcryptRequest,
  controller: AbortController,
  state: ExecutionState<Result>,
) {
  for await (const update of bcryptWithProgressUpdates<Result>(request, { controller, timeoutMs: 10_000 })) {
    switch (update.kind) {
      case 'progress': {
        state.percentage = Math.round(update.progress * 100);
        break;
      }
      case 'success': {
        state.result = update.value;
        state.timeTakenMs = update.timeTakenMs;
        break;
      }
      case 'error': {
        state.error = update.message;
        break;
      }
      case 'cancelled': {
        break;
      }
    }
  }
}

function initWatcher<Param, Result>(
  operation: BcryptRequest['operation'],
  inputs: [Ref<string | null>, Ref<Param | null>],
  state: Ref<ExecutionState<Result>>,
) {
  let controller = new AbortController();
  watch(inputs, (inputs) => {
    controller.abort(new InvalidatedError());
    controller = new AbortController();
    state.value = blankState();
    const [arg0, arg1] = inputs;
    if (arg0 != null && arg1 != null) {
      exec<Result>({ operation, args: [arg0, arg1] } as BcryptRequest, controller, state.value);
    }
  });
  onUnmounted(() => controller.abort(new InvalidatedError()));
}

const hashState = ref<ExecutionState<string>>(blankState());
const input = ref('');
const saltCount = ref(10);
initWatcher('hash', [input, saltCount], hashState);

const source = computed(() => hashState.value.result ?? '');
const { copy } = useCopy({ source, text: t('tools.bcrypt.copiedHash') });

const compareState = ref<ExecutionState<boolean>>(blankState());
const compareString = ref('');
const compareHash = ref('');
initWatcher('compare', [compareString, compareHash], compareState);
</script>

<template>
  <c-card :title="t('tools.bcrypt.hashTitle')">
    <c-input-text
      v-model:value="input"
      :placeholder="t('tools.bcrypt.inputPlaceholder')"
      raw-text
      :label="t('tools.bcrypt.inputLabel')"
      label-position="left"
      label-align="right"
      label-width="120px"
      mb-2
    />
    <n-form-item :label="t('tools.bcrypt.saltCountLabel')" label-placement="left" label-width="120">
      <n-input-number v-model:value="saltCount" :placeholder="t('tools.bcrypt.saltRoundsPlaceholder')" :max="20" :min="0" w-full />
    </n-form-item>

    <n-progress :percentage="hashState.percentage" :show-indicator="false" />
    <c-input-text
      :value="hashState.result ?? undefined"
      :placeholder="hashState.error ?? t('tools.bcrypt.hashedStringPlaceholder')"
      readonly
      text-center
    />
    <div mt-1 h-3 op-60>
      {{ hashState.timeTakenMs == null ? '' : t('tools.bcrypt.hashedIn', { time: hashState.timeTakenMs }) }}
    </div>

    <div mt-5 flex justify-center>
      <c-button @click="copy()">
        {{ t('tools.bcrypt.copyHash') }}
      </c-button>
    </div>
  </c-card>

  <c-card :title="t('tools.bcrypt.compareTitle')">
    <n-form label-width="120">
      <n-form-item :label="t('tools.bcrypt.compareStringLabel')" label-placement="left">
        <c-input-text v-model:value="compareString" :placeholder="t('tools.bcrypt.compareStringPlaceholder')" raw-text />
      </n-form-item>
      <n-form-item :label="t('tools.bcrypt.compareHashLabel')" label-placement="left">
        <c-input-text v-model:value="compareHash" :placeholder="t('tools.bcrypt.compareHashPlaceholder')" raw-text />
      </n-form-item>

      <n-progress :percentage="compareState.percentage" :show-indicator="false" />
      <div>
        <c-input-text
          id="bcrypt-compare-result"
          :value="compareState.result == null ? undefined : compareState.result ? t('tools.bcrypt.matched') : t('tools.bcrypt.noMatch')"
          :placeholder="compareState.error ?? t('tools.bcrypt.comparisonResultPlaceholder')"
          readonly
          text-center
          class="compare-result"
          :class="compareState.result == null ? undefined : compareState.result ? 'positive' : 'negative'"
        />
      </div>
      <div mb-1 mt-1 h-3 op-60>
        {{ compareState.timeTakenMs == null ? '' : t('tools.bcrypt.comparedIn', { time: compareState.timeTakenMs }) }}
      </div>
    </n-form>
  </c-card>
</template>

<style lang="less">
.compare-result {
  &.negative {
    input#bcrypt-compare-result {
      color: v-bind('themeVars.errorColor');
    }
  }
  &.positive {
    input#bcrypt-compare-result {
      color: v-bind('themeVars.successColor');
    }
  }
}
</style>

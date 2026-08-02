<script setup lang="ts">
import ctz from 'countries-and-timezones';
import getTimezoneOffset from 'get-timezone-offset';
import { type CronType, getCronDescription, getNextExecutionTimes, isCronValid } from './crontab-generator.service';
import { useStyleStore } from '@/stores/style.store';
import { useQueryParamOrStorage } from '@/composable/queryParams';

const { t } = useI18n();
const styleStore = useStyleStore();

const cron = ref('40 * * * *');
const cronType = ref<CronType>('standard');
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
  monthStartIndexZero: false,
  tzOffset: (new Date()).getTimezoneOffset() / 60,
});

// getTimezoneOffset(tz.name, now) / 60
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const allTimezones = Object.values(ctz.getAllTimezones()).map((tz) => {
  const timezoneUTCDSTOffset = tz.utcOffset === tz.dstOffset ? tz.utcOffsetStr : `${tz.utcOffsetStr}/${tz.dstOffsetStr}`;
  return {
    value: tz.name,
    label: `${tz.name === browserTimezone ? t('tools.crontab-generator.browserTimezonePrefix') : ''}${tz.name} (${timezoneUTCDSTOffset})`,
  };
});
const currentTimezone = useQueryParamOrStorage({ name: 'tz', storageName: 'crongen:tz', defaultValue: browserTimezone });
watchEffect(() => {
  cronstrueConfig.tzOffset = cronType.value === 'aws'
    ? 0
    : -getTimezoneOffset(currentTimezone.value, new Date()) / 60;
});

const commonHelpers = [
  {
    symbol: '*',
    meaning: t('tools.crontab-generator.helperAnyValue'),
    example: '* * * *',
    equivalent: t('tools.crontab-generator.helperEveryMinute'),
  },
  {
    symbol: '-',
    meaning: t('tools.crontab-generator.helperRangeOfValues'),
    example: '1-10 * * *',
    equivalent: t('tools.crontab-generator.helperMinutes1Through10'),
  },
  {
    symbol: ',',
    meaning: t('tools.crontab-generator.helperListOfValues'),
    example: '1,10 * * *',
    equivalent: t('tools.crontab-generator.helperAtMinutes1And10'),
  },
  {
    symbol: '/',
    meaning: t('tools.crontab-generator.helperStepValues'),
    example: '*/10 * * *',
    equivalent: t('tools.crontab-generator.helperEvery10Minutes'),
  },
];

const standardHelpers = [
  ...commonHelpers,
  {
    symbol: '@yearly',
    meaning: t('tools.crontab-generator.helperYearlyMeaning'),
    example: '@yearly',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@annually',
    meaning: t('tools.crontab-generator.helperAnnuallyMeaning'),
    example: '@annually',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@monthly',
    meaning: t('tools.crontab-generator.helperMonthlyMeaning'),
    example: '@monthly',
    equivalent: '0 0 1 * *',
  },
  {
    symbol: '@weekly',
    meaning: t('tools.crontab-generator.helperWeeklyMeaning'),
    example: '@weekly',
    equivalent: '0 0 * * 0',
  },
  {
    symbol: '@daily',
    meaning: t('tools.crontab-generator.helperDailyMeaning'),
    example: '@daily',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@midnight',
    meaning: t('tools.crontab-generator.helperMidnightMeaning'),
    example: '@midnight',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@hourly',
    meaning: t('tools.crontab-generator.helperHourlyMeaning'),
    example: '@hourly',
    equivalent: '0 * * * *',
  },
  {
    symbol: '@reboot',
    meaning: t('tools.crontab-generator.helperRebootMeaning'),
    example: '',
    equivalent: '',
  },
];

const awsHelpers = [
  ...commonHelpers,
  {
    symbol: '?',
    meaning: t('tools.crontab-generator.helperQuestionMeaning'),
    example: '9 * 7,9,11 5 ? 2021',
    equivalent: t('tools.crontab-generator.helperQuestionEquivalent'),
  },
  {
    symbol: 'L',
    meaning: t('tools.crontab-generator.helperLMeaning'),
    example: '9 * L 5 ? 2019,2020',
    equivalent: t('tools.crontab-generator.helperLEquivalent'),
  },
  {
    symbol: 'W',
    meaning: t('tools.crontab-generator.helperWMeaning'),
    example: '19 4 3W 9 ? 2019,2020',
    equivalent: t('tools.crontab-generator.helperWEquivalent'),
  },
  {
    symbol: '#',
    meaning: t('tools.crontab-generator.helperHashMeaning'),
    example: '9 8-20 ? 12 3#5 2019,2020',
    equivalent: t('tools.crontab-generator.helperHashEquivalent'),
  },
];

const defaultAWSCronExpression = '0 0 ? * 1 *';
const defaultStandardCronExpression = '40 * * * *';
watch(cronType,
  (newCronType) => {
    if (newCronType === 'aws') {
      if (!cron.value || cron.value === defaultStandardCronExpression) {
        cron.value = defaultAWSCronExpression;
      }
    }
    else if (newCronType === 'standard') {
      if (!cron.value || cron.value === defaultAWSCronExpression) {
        cron.value = defaultStandardCronExpression;
      }
    }
  },
);

const getHelpers = computed(() => {
  if (cronType.value === 'aws') {
    return awsHelpers;
  }
  return standardHelpers;
});

const cronString = computed(() => {
  return getCronDescription(cron.value, cronType.value, cronstrueConfig) || ' ';
});

const cronValidationRules = [
  {
    validator: (value: string) => isCronValid(value, cronType.value),
    message: t('tools.crontab-generator.invalidCron'),
  },
];

const executionTimesString = computed(() => {
  if (isCronValid(cron.value, cronType.value)) {
    try {
      const nextExecutionTimes = getNextExecutionTimes(cron.value, currentTimezone.value);
      const executionTimesString = nextExecutionTimes.join('\n');
      return `${t('tools.crontab-generator.next5ExecutionTimes')}\n${executionTimesString}`;
    }
    catch (e: any) {
      return e.toString();
    }
  }
  return ' ';
});
</script>

<template>
  <c-card>
    <div mx-auto max-w-sm>
      <c-input-text
        v-model:value="cron"
        size="large"
        placeholder="* * * * *"
        :validation-rules="cronValidationRules"
        mb-3
      />
    </div>

    <n-radio-group v-model:value="cronType" name="radiogroup" mb-2 flex justify-center>
      <n-space>
        <n-radio
          value="standard"
          :label="t('tools.crontab-generator.unixStandard')"
        />
        <n-radio
          value="aws"
          label="AWS"
        />
      </n-space>
    </n-radio-group>

    <div class="cron-string">
      {{ cronString }}
    </div>

    <div class="cron-execution-string">
      {{ executionTimesString }}
    </div>

    <n-divider />

    <div flex justify-center>
      <n-form :show-feedback="false" label-width="170" label-placement="left">
        <n-form-item :label="t('tools.crontab-generator.verbose')">
          <n-switch v-model:value="cronstrueConfig.verbose" />
        </n-form-item>
        <n-form-item :label="t('tools.crontab-generator.use24HourTimeFormat')">
          <n-switch v-model:value="cronstrueConfig.use24HourTimeFormat" />
        </n-form-item>
        <n-form-item :label="t('tools.crontab-generator.daysStartAt0')">
          <n-switch v-model:value="cronstrueConfig.dayOfWeekStartIndexZero" />
        </n-form-item>
        <n-form-item :label="t('tools.crontab-generator.monthsStartAt0')">
          <n-switch v-model:value="cronstrueConfig.monthStartIndexZero" />
        </n-form-item>
        <c-select
          v-model:value="currentTimezone"
          searchable
          :label="t('tools.crontab-generator.timezone')"
          :options="allTimezones"
          :disabled="cronType === 'aws'"
        />
        <div v-if="cronType === 'aws'" op-60>
          {{ t('tools.crontab-generator.awsCronSchedulesAreEvaluatedInUtc') }}
        </div>
      </n-form>
    </div>
  </c-card>
  <c-card>
    <pre v-if="cronType === 'standard'">
      -- {{ t('tools.crontab-generator.standardCronSyntax') }} --
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>

    <pre v-if="cronType === 'aws'">
      -- {{ t('tools.crontab-generator.awsCronSyntax') }} --
┌──────────── minute (0 - 59)
| ┌────────── hour (0 - 23)
| | ┌──────── day of month (1 - 31) OR ? OR L OR W
| | | ┌────── month (1 - 12) OR jan,feb,mar,apr ...
| | | | ┌──── day of week (0 - 6, sunday=0) OR sun,mon OR L ...
| | | | | ┌── year
| | | | | |
* * * * * *</pre>

    <div v-if="styleStore.isSmallScreen">
      <c-card v-for="{ symbol, meaning, example, equivalent } in getHelpers" :key="symbol" mb-3 important:border-none>
        <div>
          {{ t('tools.crontab-generator.symbol') }} <strong>{{ symbol }}</strong>
        </div>
        <div>
          {{ t('tools.crontab-generator.meaning') }} <strong>{{ meaning }}</strong>
        </div>
        <div>
          {{ t('tools.crontab-generator.example') }}
          <strong><code>{{ example }}</code></strong>
        </div>
        <div>
          {{ t('tools.crontab-generator.equivalent') }} <strong>{{ equivalent }}</strong>
        </div>
      </c-card>
    </div>

    <c-table v-else :data="getHelpers" />
  </c-card>
</template>

<style lang="less" scoped>
::v-deep(input) {
  font-size: 30px;
  font-family: monospace;
  padding: 5px;
  text-align: center;
}

.cron-string {
  text-align: center;
  font-size: 22px;
  opacity: 0.8;
  margin: 5px 0 15px;
}

pre {
  overflow: auto;
  padding: 10px 0;
}

.cron-execution-string{
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
  margin: 5px 0 15px;
  white-space: pre-wrap;
}
</style>

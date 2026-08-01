import { parseExpression } from 'cron-parser';
import EventCronParser from 'event-cron-parser';
import cronstrue from 'cronstrue';

export type CronType = 'standard' | 'aws';

export function getCronDescription(
  cronExpression: string,
  cronType: CronType,
  options?: Parameters<typeof cronstrue.toString>[1],
) {
  if (!isCronValid(cronExpression, cronType)) {
    return '';
  }

  if (cronType === 'aws') {
    return new EventCronParser(cronExpression, undefined, undefined, 'utc').desc('utc');
  }

  return cronstrue.toString(cronExpression, options);
}

export function getNextExecutionTimes(cronExpression: string, tz: string | undefined = undefined, count: number = 5) {
  if (getCronType(cronExpression) === 'standard') {
    const interval = parseExpression(cronExpression, { tz });
    const times = [];
    for (let i = 0; i < count; i++) {
      times.push(interval.next().toJSON());
    }
    return times;
  }
  if (getCronType(cronExpression) === 'aws') {
    const parsed = new EventCronParser(cronExpression, undefined, undefined, 'utc');
    const times = [];
    for (let i = 0; i < count; i++) {
      const nextExecution = i === 0 ? parsed.next(new Date()) : parsed.next();
      if (!nextExecution) {
        break;
      }
      times.push(nextExecution.toJSON());
    }
    return times;
  }

  return [];
}

export function isCronValid(cronExpression: string, cronType: CronType | 'any' = 'any') {
  const expressionCronType = getCronType(cronExpression);
  return cronType === 'any' ? !!expressionCronType : expressionCronType === cronType;
}

export function getCronType(cronExpression: string) {
  try {
    parseExpression(cronExpression);
    return 'standard';
  }
  catch (_) {
    try {
      const parsed = new EventCronParser(cronExpression);
      parsed.validate();
      return 'aws';
    }
    catch (_) {
    }
  }
  return false;
}

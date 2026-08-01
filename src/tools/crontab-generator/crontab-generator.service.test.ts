import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCronDescription, getCronType, getNextExecutionTimes, isCronValid } from './crontab-generator.service';

describe('crontab-generator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isCronValid', () => {
    it('should return true for all valid formats', () => {
      // standard format
      expect(isCronValid('0 0 * * 1-5')).toBe(true);
      expect(isCronValid('23 0-20/2 * * *')).toBe(true);

      // AWS formats
      expect(isCronValid('0 11-22 ? * MON-FRI *')).toBe(true);
      expect(isCronValid('0 0 ? * 1 *')).toBe(true);
    });
    it('should check standard format', () => {
      // standard format
      expect(isCronValid('0 0 * * 1-5', 'standard')).toBe(true);
      expect(isCronValid('23 0-20/2 * * *', 'standard')).toBe(true);

      // AWS format
      expect(isCronValid('0 11-22 ? * MON-FRI *', 'standard')).toBe(false);
      expect(isCronValid('0 0 ? * 1 *', 'standard')).toBe(false);
    });
    it('should check aws format', () => {
      // standard format
      expect(isCronValid('0 0 * * 1-5', 'aws')).toBe(false);
      expect(isCronValid('23 0-20/2 * * *', 'aws')).toBe(false);

      // AWS format
      expect(isCronValid('0 11-22 ? * MON-FRI *', 'aws')).toBe(true);
      expect(isCronValid('0 0 ? * 1 *', 'aws')).toBe(true);
    });
    it('should return false for all invalid formats', () => {
      expect(isCronValid('aert')).toBe(false);
      expect(isCronValid('40 *')).toBe(false);
    });
  });

  describe('getCronType', () => {
    it('should return right type', () => {
      expect(getCronType('0 0 * * 1-5')).toBe('standard');
      expect(getCronType('23 0-20/2 * * *')).toBe('standard');

      // AWS formats
      expect(getCronType('0 11-22 ? * MON-FRI *')).toBe('aws');
      expect(getCronType('0 0 ? * 1 *')).toBe('aws');

      expect(getCronType('aert')).toBe(false);
      expect(getCronType('40 *')).toBe(false);
    });
  });

  describe('getCronDescription', () => {
    it('uses AWS day-of-week numbering', () => {
      expect(getCronDescription('0 0 ? * 1 *', 'aws')).toContain('Sunday');
    });
  });

  describe('getNextExecutionTimes', () => {
    it('should return next valid datetimes', () => {
      expect(getNextExecutionTimes('0 0 * * 1-5')).toHaveLength(5);
      expect(getNextExecutionTimes('23 0-20/2 * * *')).toHaveLength(5);

      // AWS formats
      expect(getNextExecutionTimes('0 11-22 ? * MON-FRI *')).toHaveLength(5);
      expect(getNextExecutionTimes('0 0 ? * 1 *')).toHaveLength(5);
    });

    it('evaluates AWS schedules in UTC after the current time', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-02T00:30:00.000Z'));

      expect(getNextExecutionTimes('0 1 ? * * *', 'Asia/Shanghai', 1)).toEqual([
        '2026-08-02T01:00:00.000Z',
      ]);
    });
  });
});

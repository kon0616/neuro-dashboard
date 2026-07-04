import { useState, useEffect, useCallback } from 'react';
import type { DailyRecord } from '../types';
import { getAllRecords, getRecord, getRecordsInRange } from '../lib/storage';

/**
 * 管理历史记录的 hook
 * - 获取全部记录
 * - 获取指定范围记录
 * - 获取单日记录
 */
export function useHistory() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const all = getAllRecords();
    setRecords(all);
    setIsLoaded(true);
  }, []);

  const refresh = useCallback(() => {
    const all = getAllRecords();
    setRecords(all);
  }, []);

  /** 获取指定天数范围内的记录 */
  const getRange = useCallback(
    (days: number): DailyRecord[] => {
      return getRecordsInRange(days);
    },
    []
  );

  /** 获取指定日期的记录 */
  const getByDate = useCallback(
    (date: string): DailyRecord | null => {
      return getRecord(date);
    },
    []
  );

  return {
    records,
    isLoaded,
    refresh,
    getRange,
    getByDate,
  };
}

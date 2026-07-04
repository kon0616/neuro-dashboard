import { useState, useEffect, useCallback } from 'react';
import { createEmptyRecord, type DailyRecord } from '../types';
import { getRecord, saveRecord } from '../lib/storage';
import { getToday } from '../lib/utils';

/**
 * 管理今日记录的 hook
 * - 自动加载今日数据，无数据时创建空记录
 * - 每次更新自动持久化到 localStorage
 */
export function useDailyRecord() {
  const today = getToday();
  const [record, setRecord] = useState<DailyRecord>(() => {
    const saved = getRecord(today);
    return saved ?? createEmptyRecord(today);
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // 首次加载
  useEffect(() => {
    const saved = getRecord(today);
    if (saved) {
      setRecord(saved);
    }
    setIsLoaded(true);
  }, [today]);

  // 部分更新并自动保存
  const updateRecord = useCallback(
    (partial: Partial<DailyRecord> | ((prev: DailyRecord) => DailyRecord)) => {
      setRecord((prev) => {
        const next =
          typeof partial === 'function' ? partial(prev) : { ...prev, ...partial };
        saveRecord(next);
        return next;
      });
    },
    []
  );

  // 更新子模块
  const updateBrain = useCallback(
    (brain: Partial<DailyRecord['brain']>) => {
      setRecord((prev) => {
        const next: DailyRecord = {
          ...prev,
          brain: { ...prev.brain, ...brain },
        };
        saveRecord(next);
        return next;
      });
    },
    []
  );

  const updateBody = useCallback(
    (body: Partial<DailyRecord['body']>) => {
      setRecord((prev) => {
        const next: DailyRecord = {
          ...prev,
          body: { ...prev.body, ...body },
        };
        saveRecord(next);
        return next;
      });
    },
    []
  );

  const updateSensory = useCallback(
    (sensory: Partial<DailyRecord['sensory']>) => {
      setRecord((prev) => {
        const next: DailyRecord = {
          ...prev,
          sensory: { ...prev.sensory, ...sensory },
        };
        saveRecord(next);
        return next;
      });
    },
    []
  );

  const updateBehavior = useCallback(
    (behavior: Partial<DailyRecord['behavior']>) => {
      setRecord((prev) => {
        const next: DailyRecord = {
          ...prev,
          behavior: { ...prev.behavior, ...behavior },
        };
        saveRecord(next);
        return next;
      });
    },
    []
  );

  const updateEnvironment = useCallback(
    (environment: Partial<DailyRecord['environment']>) => {
      setRecord((prev) => {
        const next: DailyRecord = {
          ...prev,
          environment: { ...prev.environment, ...environment },
        };
        saveRecord(next);
        return next;
      });
    },
    []
  );

  return {
    record,
    isLoaded,
    updateRecord,
    updateBrain,
    updateBody,
    updateSensory,
    updateBehavior,
    updateEnvironment,
  };
}

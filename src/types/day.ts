import type { Session } from './session';
import type { AppEvent } from './event';

/** 每日睡眠（日级别，非会话级别） */
export interface DaySleep {
  hours: number;       // 0-14
  quality: number;     // 1-5
}

/** 每日记录（聚合） */
export interface DayRecord {
  date: string;                      // YYYY-MM-DD
  sleep: DaySleep;
  sessions: Session[];
  events: AppEvent[];
  dailyDifference: string;
}

/** 创建默认空日记录 */
export function createEmptyDayRecord(date: string): DayRecord {
  return {
    date,
    sleep: { hours: 7, quality: 3 },
    sessions: [],
    events: [],
    dailyDifference: '',
  };
}

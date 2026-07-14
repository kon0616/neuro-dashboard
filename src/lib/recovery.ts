/**
 * 数据恢复工具
 */

import type { DayRecord } from '../types/day';

const V1_KEY = 'neuro-dashboard-records';
const V2_KEY = 'neuro-v2-days';

/** 尝试从 v1 备份恢复数据 */
export function tryRecoverFromV1(): { recovered: number; skipped: number } {
  const v1Raw = localStorage.getItem(V1_KEY);
  if (!v1Raw) return { recovered: 0, skipped: 0 };

  try {
    const v1Data = JSON.parse(v1Raw);
    if (!Array.isArray(v1Data) || !v1Data.length) return { recovered: 0, skipped: 0 };

    const existingRaw = localStorage.getItem(V2_KEY);
    let existing: DayRecord[] = [];
    if (existingRaw) {
      try { existing = JSON.parse(existingRaw); } catch { /* ignore */ }
    }
    const existingDates = new Set(existing.map((d) => d.date));

    let recovered = 0;
    let skipped = 0;

    for (const oldRecord of v1Data) {
      const date = oldRecord.date;
      if (!date || existingDates.has(date)) {
        skipped++;
        continue;
      }

      // 将 v1 记录转为 v2 格式
      const day: DayRecord = {
        date,
        sleep: {
          hours: oldRecord.body?.sleepHours ?? 7,
          quality: oldRecord.body?.sleepQuality ?? 3,
        },
        sessions: [{
          id: crypto.randomUUID(),
          timestamp: `${date}T09:00:00`,
          period: 'morning' as const,
          brain: {
            thinkingSpeed: oldRecord.brain?.thinkingSpeed ?? 3,
            newIdeas: (oldRecord.brain?.newIdeas as '0' | '1-3' | '4-10' | '10+') ?? '0',
            activeProjects: oldRecord.brain?.activeProjects ?? 0,
            canStopThinking: (oldRecord.brain?.canStopThinking as 'yes' | 'difficult' | 'no') ?? 'yes',
          },
          body: {
            energy: oldRecord.body?.energy ?? 3,
            appetite: oldRecord.body?.appetite ?? 3,
            physicalTension: oldRecord.body?.physicalTension ?? 3,
          },
          sensory: {
            soundOverload: oldRecord.sensory?.soundOverload ?? 0,
            lightOverload: oldRecord.sensory?.lightOverload ?? 0,
            socialOverload: oldRecord.sensory?.socialOverload ?? 0,
            infoOverload: oldRecord.sensory?.infoOverload ?? 0,
          },
          behavior: oldRecord.behavior ?? {},
          environment: {
            screenTime: oldRecord.environment?.screenTime ?? 0,
            caffeine: oldRecord.environment?.caffeine ?? 0,
            exercise: oldRecord.environment?.exercise ?? 0,
            timeOutside: oldRecord.environment?.timeOutside ?? 0,
          },
        }],
        events: [],
        dailyDifference: '',
      };

      existing.push(day);
      recovered++;
    }

    existing.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(V2_KEY, JSON.stringify(existing));

    return { recovered, skipped };
  } catch {
    return { recovered: 0, skipped: 0 };
  }
}

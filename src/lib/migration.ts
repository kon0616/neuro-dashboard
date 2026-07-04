/**
 * v1 → v2 数据迁移
 *
 * 将旧的 DailyRecord[] (key: neuro-dashboard-records) 转换为 v2 的会话模型。
 * 迁移幂等：运行一次后设置标记，不会重复执行。
 */

import type { Session } from '../types/session';
import { createEmptySession } from '../types/session';
import type { DayRecord } from '../types/day';
import { createEmptyDayRecord } from '../types/day';
import { DEFAULT_BEHAVIORS } from '../constants/defaultBehaviors';
import { DEFAULT_EVENT_TYPES } from '../constants/defaultEvents';
import type { BehaviorDefinition } from '../types/behavior';
import type { EventTypeDefinition } from '../types/event';

const V1_KEY = 'neuro-dashboard-records';
const V2_MIGRATED_KEY = 'neuro-v2-migrated';

interface V1DailyRecord {
  date: string;
  brain: {
    thinkingSpeed: number;
    newIdeas: string;
    activeProjects: number;
    canStopThinking: string;
  };
  body: {
    sleepHours: number;
    sleepQuality: number;
    energy: number;
    appetite: number;
    physicalTension: number;
  };
  sensory: {
    soundOverload: number;
    lightOverload: number;
    socialOverload: number;
    infoOverload: number;
  };
  behavior: Record<string, boolean>;
  environment: {
    stress: number;
    screenTime: number;
    caffeine: number;
    exercise: number;
    timeOutside: number;
  };
}

/** 检查是否需要迁移 */
export function needsMigration(): boolean {
  if (localStorage.getItem(V2_MIGRATED_KEY)) return false;
  const v1Data = localStorage.getItem(V1_KEY);
  return v1Data !== null && v1Data !== '[]';
}

/** 执行 v1 → v2 迁移 */
export function migrateV1ToV2(): void {
  if (localStorage.getItem(V2_MIGRATED_KEY)) return;

  const v1Raw = localStorage.getItem(V1_KEY);
  if (!v1Raw) {
    // 无 v1 数据，初始化 v2 默认值
    initializeV2Defaults();
    localStorage.setItem(V2_MIGRATED_KEY, 'true');
    return;
  }

  try {
    const v1Records: V1DailyRecord[] = JSON.parse(v1Raw);
    if (!v1Records.length) {
      initializeV2Defaults();
      localStorage.setItem(V2_MIGRATED_KEY, 'true');
      return;
    }

    // 迁移每条 v1 记录为单个 Morning 会话
    const days: DayRecord[] = v1Records.map((r) => {
      const session: Session = {
        ...createEmptySession(`${r.date}T09:00:00`),
        brain: {
          thinkingSpeed: r.brain.thinkingSpeed,
          newIdeas: r.brain.newIdeas as '0' | '1-3' | '4-10' | '10+',
          activeProjects: r.brain.activeProjects,
          canStopThinking: r.brain.canStopThinking as 'yes' | 'difficult' | 'no',
        },
        body: {
          energy: r.body.energy,
          appetite: r.body.appetite,
          physicalTension: r.body.physicalTension,
        },
        sensory: r.sensory,
        behavior: { ...r.behavior },
        environment: {
          screenTime: r.environment.screenTime,
          caffeine: r.environment.caffeine,
          exercise: r.environment.exercise,
          timeOutside: r.environment.timeOutside,
        },
      };

      return {
        ...createEmptyDayRecord(r.date),
        sleep: { hours: r.body.sleepHours, quality: r.body.sleepQuality },
        sessions: [session],
      };
    });

    // 写入 v2 格式
    localStorage.setItem('neuro-v2-days', JSON.stringify(days));
    initializeV2Defaults();

    // 保留 v1 数据作为备份（不删除）
    localStorage.setItem(V2_MIGRATED_KEY, 'true');
  } catch {
    // 迁移失败，初始化空数据
    initializeV2Defaults();
    localStorage.setItem(V2_MIGRATED_KEY, 'true');
  }
}

/** 初始化 v2 默认值 */
function initializeV2Defaults(): void {
  if (!localStorage.getItem('neuro-v2-behaviors')) {
    localStorage.setItem('neuro-v2-behaviors', JSON.stringify(DEFAULT_BEHAVIORS));
  }
  if (!localStorage.getItem('neuro-v2-event-types')) {
    localStorage.setItem('neuro-v2-event-types', JSON.stringify(DEFAULT_EVENT_TYPES));
  }
  if (!localStorage.getItem('neuro-v2-ai-config')) {
    localStorage.setItem('neuro-v2-ai-config', JSON.stringify({
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-4o-mini',
      enabled: false,
    }));
  }
  if (!localStorage.getItem('neuro-v2-insights')) {
    localStorage.setItem('neuro-v2-insights', JSON.stringify([]));
  }
}

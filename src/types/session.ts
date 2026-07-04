/** 时段枚举 */
export type DayPeriod = 'morning' | 'afternoon' | 'night';

/** 根据时间戳自动推断时段 */
export function detectPeriod(timestamp: string): DayPeriod {
  const hour = new Date(timestamp).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'afternoon';
  return 'night';
}

/** 时段显示名称 */
export const periodLabels: Record<DayPeriod, string> = {
  morning: '上午',
  afternoon: '下午',
  night: '夜晚',
};

/** 会话（单次签到） */
export interface Session {
  id: string;
  timestamp: string;           // ISO 8601
  period: DayPeriod;
  brain: SessionBrain;
  body: SessionBody;
  sensory: SessionSensory;
  behavior: Record<string, boolean>;  // behaviorId → boolean
  environment: SessionEnvironment;
  note?: string;
}

export interface SessionBrain {
  thinkingSpeed: number;       // 1-5
  newIdeas: '0' | '1-3' | '4-10' | '10+';
  activeProjects: number;      // 0-10
  canStopThinking: 'yes' | 'difficult' | 'no';
}

export interface SessionBody {
  energy: number;              // 1-5
  appetite: number;            // 1-5
  physicalTension: number;     // 1-5
}

export interface SessionSensory {
  soundOverload: number;       // 0-5
  lightOverload: number;       // 0-5
  socialOverload: number;      // 0-5
  infoOverload: number;        // 0-5
}

export interface SessionEnvironment {
  screenTime: number;          // hours
  caffeine: number;            // cups
  exercise: number;            // minutes
  timeOutside: number;         // minutes
}

/** 创建默认空会话 */
export function createEmptySession(timestamp?: string): Session {
  const ts = timestamp ?? new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    timestamp: ts,
    period: detectPeriod(ts),
    brain: {
      thinkingSpeed: 3,
      newIdeas: '0',
      activeProjects: 0,
      canStopThinking: 'yes',
    },
    body: {
      energy: 3,
      appetite: 3,
      physicalTension: 3,
    },
    sensory: {
      soundOverload: 0,
      lightOverload: 0,
      socialOverload: 0,
      infoOverload: 0,
    },
    behavior: {},
    environment: {
      screenTime: 0,
      caffeine: 0,
      exercise: 0,
      timeOutside: 0,
    },
  };
}

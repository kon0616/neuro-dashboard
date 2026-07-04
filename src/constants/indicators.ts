import type { RiskResult } from '../types/risk';
import type { Session } from '../types/session';
import { getBehaviorDefinitions } from '../lib/storage';

/**
 * v2 风险检测规则引擎 — 基于多会话
 */

/** 激活趋势检测 */
function detectActivation(
  sessions: Session[],
  prevSessions: Session[]
): RiskResult | null {
  const indicators: string[] = [];
  const sourceIds: string[] = [];

  for (const s of sessions) {
    if (s.brain.thinkingSpeed >= 4) {
      indicators.push('思考速度加快');
      sourceIds.push(s.id);
    }
    if (s.brain.newIdeas === '4-10' || s.brain.newIdeas === '10+') {
      indicators.push('新想法增多');
      if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
    }
  }

  // 检查行为类别
  const behaviors = getBehaviorDefinitions();
  const activationBehaviors = behaviors.filter((b) => b.category === 'activation');
  for (const s of sessions) {
    for (const b of activationBehaviors) {
      if (s.behavior[b.id]) {
        indicators.push(b.label);
        if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
      }
    }
  }

  // 睡眠减少
  const avgSleep =
    sessions.reduce((sum, s) => sum + s.body.sleepHours, 0) / sessions.length;
  const prevAvgSleep = prevSessions.length
    ? prevSessions.reduce((sum, s) => sum + s.body.sleepHours, 0) / prevSessions.length
    : 8;
  if (avgSleep <= 5 || (prevSessions.length > 0 && avgSleep < prevAvgSleep - 1)) {
    indicators.push('睡眠减少');
  }

  // 去重
  const uniqueIndicators = [...new Set(indicators)];
  const uniqueIds = [...new Set(sourceIds)];

  if (uniqueIndicators.length < 3) return null;
  const level = uniqueIndicators.length >= 5 ? 'caution' : 'warning';

  return {
    level,
    type: 'activation',
    message:
      level === 'caution'
        ? '多项指标显示神经系统处于高度激活状态。考虑放慢节奏。'
        : '检测到可能的激活趋势。注意休息和节奏。',
    indicators: uniqueIndicators,
    sourceSessionIds: uniqueIds,
  };
}

/** 关闭/低落趋势检测 */
function detectShutdown(
  sessions: Session[],
  prevSessions: Session[]
): RiskResult | null {
  const indicators: string[] = [];
  const sourceIds: string[] = [];

  for (const s of sessions) {
    if (s.body.energy <= 2) {
      indicators.push('精力偏低');
      sourceIds.push(s.id);
    }
    if (s.brain.thinkingSpeed <= 2) {
      indicators.push('思考速度减慢');
      if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
    }
    if (s.body.physicalTension >= 4) {
      indicators.push('身体紧张度高');
      if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
    }
  }

  // 检查关闭类行为
  const behaviors = getBehaviorDefinitions();
  const shutdownBehaviors = behaviors.filter((b) => b.category === 'shutdown');
  for (const s of sessions) {
    for (const b of shutdownBehaviors) {
      if (s.behavior[b.id]) {
        indicators.push(b.label);
        if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
      }
    }
  }

  // 精力下降趋势
  const avgEnergy =
    sessions.reduce((sum, s) => sum + s.body.energy, 0) / sessions.length;
  const prevAvgEnergy = prevSessions.length
    ? prevSessions.reduce((sum, s) => sum + s.body.energy, 0) / prevSessions.length
    : 3;

  if (prevSessions.length > 0 && avgEnergy < prevAvgEnergy - 1) {
    indicators.push('精力持续下降');
  }

  const uniqueIndicators = [...new Set(indicators)];
  const uniqueIds = [...new Set(sourceIds)];

  if (uniqueIndicators.length < 3) return null;
  const level = uniqueIndicators.length >= 5 ? 'caution' : 'warning';

  return {
    level,
    type: 'shutdown',
    message:
      level === 'caution'
        ? '多项指标提示能量处于低位。给自己多一些空间和休息。'
        : '检测到能量可能下降。关注自己当下的需求。',
    indicators: uniqueIndicators,
    sourceSessionIds: uniqueIds,
  };
}

/** 感官过载检测 */
function detectSensoryOverload(sessions: Session[]): RiskResult | null {
  const indicators: string[] = [];
  const sourceIds: string[] = [];

  for (const s of sessions) {
    if (s.sensory.soundOverload >= 4) {
      indicators.push('声音过载');
      sourceIds.push(s.id);
    }
    if (s.sensory.lightOverload >= 4) {
      indicators.push('光线过载');
      if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
    }
    if (s.sensory.socialOverload >= 4) {
      indicators.push('社交过载');
      if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
    }
    if (s.sensory.infoOverload >= 4) {
      indicators.push('信息过载');
      if (!sourceIds.includes(s.id)) sourceIds.push(s.id);
    }
  }

  const uniqueIndicators = [...new Set(indicators)];
  const uniqueIds = [...new Set(sourceIds)];

  if (uniqueIndicators.length === 0) return null;

  const level = uniqueIndicators.length >= 3 ? 'warning' : 'info';

  return {
    level,
    type: 'sensory_overload',
    message:
      level === 'warning'
        ? '感官系统负担较重。减少刺激可能有所帮助。'
        : '有轻微感官过载迹象。',
    indicators: uniqueIndicators,
    sourceSessionIds: uniqueIds,
  };
}

/** 综合风险检测 */
export function detectRisks(
  sessions: Session[],
  prevSessions: Session[] = []
): RiskResult[] {
  const results: RiskResult[] = [];

  const activation = detectActivation(sessions, prevSessions);
  if (activation) results.push(activation);

  const shutdown = detectShutdown(sessions, prevSessions);
  if (shutdown) results.push(shutdown);

  const sensory = detectSensoryOverload(sessions);
  if (sensory) results.push(sensory);

  return results;
}

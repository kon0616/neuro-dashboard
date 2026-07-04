import { useMemo } from 'react';
import type { RiskResult } from '../types/risk';
import type { Session } from '../types/session';
import { detectRisks } from '../constants/indicators';
import { getDay } from '../lib/storage';
import { getToday } from '../lib/utils';

/**
 * 基于当前日所有会话 + 前一日会话计算风险
 * v2: 接受 Session[] 而非单个 DailyRecord
 */
export function useRiskDetection(sessions: Session[] | null): {
  risks: RiskResult[];
  hasRisks: boolean;
} {
  return useMemo(() => {
    if (!sessions || sessions.length === 0) return { risks: [], hasRisks: false };

    // 获取昨日会话用于趋势对比
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const prevDate = yesterday.toISOString().slice(0, 10);
    const prevDay = getDay(prevDate);
    const prevSessions = prevDay?.sessions ?? [];

    const risks = detectRisks(sessions, prevSessions);
    return { risks, hasRisks: risks.length > 0 };
  }, [sessions]);
}

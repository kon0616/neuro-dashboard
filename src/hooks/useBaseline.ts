import { useMemo } from 'react';
import type { Baseline } from '../types/analytics';
import { getDaysInRange } from '../lib/storage';
import { getToday } from '../lib/utils';

/**
 * 计算滚动基线（过去 windowDays 天，排除今天）
 */
export function useBaseline(windowDays: number = 14): Baseline | null {
  return useMemo(() => {
    const today = getToday();
    const days = getDaysInRange(windowDays + 1).filter((d) => d.date !== today);

    // 收集所有会话的每日平均值
    const dailyAvgs = days
      .filter((d) => d.sessions.length > 0)
      .map((d) => {
        const sessions = d.sessions;
        const n = sessions.length;
        return {
          thinkingSpeed: sessions.reduce((s, r) => s + r.brain.thinkingSpeed, 0) / n,
          energy: sessions.reduce((s, r) => s + r.body.energy, 0) / n,
          sensoryLoad:
            sessions.reduce(
              (s, r) =>
                s +
                r.sensory.soundOverload +
                r.sensory.lightOverload +
                r.sensory.socialOverload +
                r.sensory.infoOverload,
              0
            ) / n,
          sleepHours: sessions.reduce((s, r) => s + r.body.sleepHours, 0) / n,
        };
      });

    if (dailyAvgs.length < 3) return null;

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr: number[], m: number) =>
      Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);

    const thinkingSpeeds = dailyAvgs.map((d) => d.thinkingSpeed);
    const energies = dailyAvgs.map((d) => d.energy);
    const sensoryLoads = dailyAvgs.map((d) => d.sensoryLoad);
    const sleepHours = dailyAvgs.map((d) => d.sleepHours);

    const thinkingSpeedAvg = mean(thinkingSpeeds);
    const energyAvg = mean(energies);
    const sensoryLoadAvg = mean(sensoryLoads);
    const sleepHoursAvg = mean(sleepHours);

    return {
      thinkingSpeedAvg,
      energyAvg,
      sensoryLoadAvg,
      sleepHoursAvg,
      deviations: {
        thinkingSpeed: std(thinkingSpeeds, thinkingSpeedAvg),
        energy: std(energies, energyAvg),
        sensoryLoad: std(sensoryLoads, sensoryLoadAvg),
        sleepHours: std(sleepHours, sleepHoursAvg),
      },
    };
  }, [windowDays]);
}

/**
 * 计算单次会话对基线的偏差
 */
export function computeDeviation(
  value: number,
  baselineMean: number,
  baselineStd: number
): number {
  if (baselineStd === 0) return 0;
  return (value - baselineMean) / baselineStd;
}

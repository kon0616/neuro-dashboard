/** 基线统计 */
export interface Baseline {
  thinkingSpeedAvg: number;
  energyAvg: number;
  sensoryLoadAvg: number;
  sleepHoursAvg: number;
  deviations: {
    thinkingSpeed: number;
    energy: number;
    sensoryLoad: number;
    sleepHours: number;
  };
}

/** 偏差分数 */
export interface DeviationScore {
  metric: string;
  zScore: number;
  direction: 'above' | 'below' | 'within_range';
}

/** 趋势数据点 */
export interface TrendDataPoint {
  date: string;
  label: string;
  [key: string]: string | number;
}

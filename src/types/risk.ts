/** 风险检测结果 */
export interface RiskResult {
  level: 'none' | 'info' | 'warning' | 'caution';
  type: 'activation' | 'shutdown' | 'sensory_overload' | null;
  message: string;
  indicators: string[];
  sourceSessionIds: string[];
}

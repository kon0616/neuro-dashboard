import { useState } from 'react';
import { TrendChart } from './TrendChart';
import { TimeRangeToggle } from './TimeRangeToggle';
import { getDaysInRange, getAllSessions } from '../../lib/storage';
import type { DayRecord } from '../../types/day';

/**
 * v2 趋势视图 — 基于会话聚合
 */
export function TrendView() {
  const [range, setRange] = useState<7 | 30>(7);

  const days = getDaysInRange(range);
  const hasData = days.some((d) => d.sessions.length > 0);

  if (!hasData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">趋势</h2>
          <TimeRangeToggle range={range} onChange={setRange} />
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="font-mono text-sm text-slate-500">数据不足</p>
          <p className="mt-1 text-xs text-slate-600">
            记录更多天的数据后将在此显示趋势图
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300">趋势</h2>
        <TimeRangeToggle range={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TrendChart
          title="睡眠时长"
          records={days}
          getValue={(d) => d.sleep.hours}
          max={14}
          color="#60a5fa"
          unit="h"
        />
        <TrendChart
          title="思考速度"
          records={days}
          getValue={(d) => dailyAvg(d, (s) => s.brain.thinkingSpeed)}
          max={5}
          color="#a78bfa"
        />
        <TrendChart
          title="精力"
          records={days}
          getValue={(d) => dailyAvg(d, (s) => s.body.energy)}
          max={5}
          color="#4ade80"
        />
        <TrendChart
          title="感官总负荷"
          records={days}
          getValue={(d) =>
            dailyAvg(
              d,
              (s) =>
                s.sensory.soundOverload +
                s.sensory.lightOverload +
                s.sensory.socialOverload +
                s.sensory.infoOverload
            )
          }
          max={20}
          color="#f59e0b"
        />
        <TrendChart
          title="行为活跃度"
          records={days}
          getValue={(d) =>
            d.sessions.length > 0
              ? d.sessions.reduce(
                  (sum, s) => sum + Object.values(s.behavior).filter(Boolean).length,
                  0
                ) / d.sessions.length
              : 0
          }
          max={9}
          color="#f87171"
        />
        <TrendChart
          title="检查次数"
          records={days}
          getValue={(d) => d.sessions.length}
          max={10}
          color="#fb923c"
          unit="次"
        />
      </div>
    </div>
  );
}

/** 计算日平均 */
function dailyAvg(
  day: DayRecord,
  getter: (s: DayRecord['sessions'][0]) => number
): number {
  if (day.sessions.length === 0) return 0;
  return (
    day.sessions.reduce((sum, s) => sum + getter(s), 0) / day.sessions.length
  );
}

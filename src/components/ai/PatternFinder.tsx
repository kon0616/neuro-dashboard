import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Clock } from 'lucide-react';
import { getAllSessions, getDaysInRange, getBehaviorDefinitions } from '../../lib/storage';
import { getToday, formatDate } from '../../lib/utils';

type TimeScale = 3 | 7 | 30 | 90 | -1; // -1 = All Time

const scaleLabels: { scale: TimeScale; label: string }[] = [
  { scale: 3, label: '3天' },
  { scale: 7, label: '7天' },
  { scale: 30, label: '30天' },
  { scale: 90, label: '90天' },
  { scale: -1, label: '全部' },
];

interface Pattern {
  type: 'short_term' | 'trend' | 'correlation' | 'cycle' | 'signature';
  title: string;
  description: string;
}

/**
 * Pattern Finder — 多时间尺度模式发现
 */
export function PatternFinder() {
  const [scale, setScale] = useState<TimeScale>(7);

  const patterns = useMemo(() => {
    switch (scale) {
      case 3: return findShortTermPatterns();
      case 7: return findTrendPatterns();
      case 30: return findCorrelationPatterns();
      case 90: return findCyclePatterns();
      case -1: return findSignaturePatterns();
    }
  }, [scale]);

  return (
    <div className="space-y-4">
      {/* 时间尺度选择器 */}
      <div className="flex gap-1 rounded-lg bg-panel-hover p-0.5">
        {scaleLabels.map(({ scale: s, label }) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors
              ${
                scale === s
                  ? 'bg-panel-card text-slate-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 模式结果 */}
      {patterns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-mono text-sm text-slate-500">数据不足</p>
          <p className="mt-1 text-xs text-slate-600">
            需要更多记录来发现此时间尺度的模式
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {patterns.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-panel-border bg-panel-card p-4"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 rounded bg-panel-hover px-1.5 py-0.5">
                  {p.type === 'short_term' ? '短期' :
                   p.type === 'trend' ? '趋势' :
                   p.type === 'correlation' ? '关联' :
                   p.type === 'cycle' ? '周期' : '特征'}
                </span>
                <h4 className="text-sm font-medium text-slate-200">{p.title}</h4>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">{p.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === 本地模式检测函数 ===

/** 3天：短期连续变化 */
function findShortTermPatterns(): Pattern[] {
  const sessions = getAllSessions();
  if (sessions.length < 3) return [];

  const byDate = new Map<string, typeof sessions>();
  sessions.forEach((s) => {
    const d = s.timestamp.slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(s);
  });

  const dates = [...byDate.keys()].sort().slice(-3);
  if (dates.length < 3) return [];

  const patterns: Pattern[] = [];
  const today = getToday();
  if (!dates.includes(today)) return patterns;

  // 检测连续变化
  const avgThinking = dates.map((d) => {
    const ss = byDate.get(d)!;
    return ss.reduce((sum, s) => sum + s.brain.thinkingSpeed, 0) / ss.length;
  });

  if (avgThinking[2] > avgThinking[0] + 1) {
    patterns.push({
      type: 'short_term',
      title: '思考速度持续上升',
      description: `过去3天思考速度从 ${avgThinking[0].toFixed(1)} 升至 ${avgThinking[2].toFixed(1)}`,
    });
  }

  const yesterday = sessions.filter((s) => s.timestamp.slice(0, 10) === dates[1]);
  const todaySess = sessions.filter((s) => s.timestamp.slice(0, 10) === dates[2]);
  if (yesterday.length > 0 && todaySess.length > 0) {
    const yAvgEnergy = yesterday.reduce((s, r) => s + r.body.energy, 0) / yesterday.length;
    const tAvgEnergy = todaySess.reduce((s, r) => s + r.body.energy, 0) / todaySess.length;
    if (tAvgEnergy < yAvgEnergy - 1) {
      patterns.push({
        type: 'short_term',
        title: '精力持续下降',
        description: `近两日精力从 ${yAvgEnergy.toFixed(1)} 降至 ${tAvgEnergy.toFixed(1)}`,
      });
    }
  }

  return patterns;
}

/** 7天：趋势偏离基线 */
function findTrendPatterns(): Pattern[] {
  const days = getDaysInRange(7).filter((d) => d.sessions.length > 0);
  if (days.length < 3) return [];

  const patterns: Pattern[] = [];

  // 计算7天均值
  const dailySensory = days.map((d) => {
    return d.sessions.reduce((sum, s) =>
      sum + s.sensory.soundOverload + s.sensory.lightOverload + s.sensory.socialOverload + s.sensory.infoOverload, 0
    ) / d.sessions.length;
  });
  const avgSensory = dailySensory.reduce((a, b) => a + b, 0) / dailySensory.length;

  // 检查最近3天是否连续高于均值
  const recent = dailySensory.slice(-3);
  if (recent.every((v) => v > avgSensory)) {
    patterns.push({
      type: 'trend',
      title: '感官负荷持续偏高',
      description: `过去3天的感官负荷均高于7天平均值 (${avgSensory.toFixed(1)})`,
    });
  }

  return patterns;
}

/** 30天：关联规则 */
function findCorrelationPatterns(): Pattern[] {
  const days = getDaysInRange(30).filter((d) => d.sessions.length > 0);
  if (days.length < 14) return [];

  const patterns: Pattern[] = [];

  // 检测高CPU天是否与高感官天关联
  let highCpuDays = 0;
  let highCpuWithSensory = 0;

  days.forEach((d) => {
    const avgCPU = d.sessions.reduce((s, r) => s + r.brain.thinkingSpeed, 0) / d.sessions.length;
    const avgSensory = d.sessions.reduce((s, r) =>
      s + r.sensory.soundOverload + r.sensory.lightOverload + r.sensory.socialOverload + r.sensory.infoOverload, 0
    ) / d.sessions.length;

    if (avgCPU >= 4) {
      highCpuDays++;
      if (avgSensory >= 8) highCpuWithSensory++;
    }
  });

  if (highCpuDays >= 3 && highCpuWithSensory / highCpuDays >= 0.6) {
    patterns.push({
      type: 'correlation',
      title: '高CPU与感官负荷关联',
      description: `${Math.round((highCpuWithSensory / highCpuDays) * 100)}% 的高思考速度日同时出现了高感官负荷`,
    });
  }

  return patterns;
}

/** 90天：周期模式 */
function findCyclePatterns(): Pattern[] {
  const sessions = getAllSessions();
  if (sessions.length < 30) return [];

  const patterns: Pattern[] = [];

  // 简化的周期检测：寻找连续高CPU天之间的间隔
  const highCpuDates: string[] = [];
  const byDate = new Map<string, number>();
  sessions.forEach((s) => {
    const d = s.timestamp.slice(0, 10);
    byDate.set(d, (byDate.get(d) ?? 0) + s.brain.thinkingSpeed);
  });

  byDate.forEach((sum, date) => {
    const count = sessions.filter((s) => s.timestamp.slice(0, 10) === date).length;
    if (count > 0 && sum / count >= 3.5) highCpuDates.push(date);
  });

  highCpuDates.sort();
  if (highCpuDates.length >= 4) {
    patterns.push({
      type: 'cycle',
      title: '高CPU周期',
      description: `过去90天出现了 ${highCpuDates.length} 次高思考速度日。系统正在学习你的个人节奏。`,
    });
  }

  return patterns;
}

/** All Time：个人特征签名 */
function findSignaturePatterns(): Pattern[] {
  const sessions = getAllSessions();
  if (sessions.length < 20) return [];

  const patterns: Pattern[] = [];

  // Top 行为统计
  const behaviorCounts = new Map<string, number>();
  sessions.forEach((s) => {
    Object.entries(s.behavior)
      .filter(([, v]) => v)
      .forEach(([k]) => behaviorCounts.set(k, (behaviorCounts.get(k) ?? 0) + 1));
  });

  const topBehaviors = [...behaviorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topBehaviors.length > 0) {
    patterns.push({
      type: 'signature',
      title: 'Top 预警信号',
      description: topBehaviors
        .map(([name, count], i) => `${i + 1}. ${name}（${count}次）`)
        .join('\n'),
    });
  }

  // 个人统计
  const totalDays = new Set(sessions.map((s) => s.timestamp.slice(0, 10))).size;
  const totalSessions = sessions.length;
  patterns.push({
    type: 'signature',
    title: '你的数据概览',
    description: `共记录 ${totalDays} 天，${totalSessions} 次签到。平均每天 ${(totalSessions / Math.max(totalDays, 1)).toFixed(1)} 次。`,
  });

  return patterns;
}

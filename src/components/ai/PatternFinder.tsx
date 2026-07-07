import { useState, useMemo } from 'react';
import { getAllSessions } from '../../lib/storage';
import { getBehaviorLabel } from '../../hooks/useBehaviors';

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

/** 日常指标平均 */
function dailyAvgSessions(sessions: ReturnType<typeof getAllSessions>) {
  const byDate = new Map<string, typeof sessions>();
  sessions.forEach((s) => {
    const d = s.timestamp.slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(s);
  });
  const dates = [...byDate.keys()].sort();
  return dates.map((d) => {
    const ss = byDate.get(d)!;
    const n = ss.length;
    return {
      date: d,
      sessions: n,
      thinkingSpeed: ss.reduce((s, r) => s + r.brain.thinkingSpeed, 0) / n,
      energy: ss.reduce((s, r) => s + r.body.energy, 0) / n,
      sensory: ss.reduce((s, r) => s + r.sensory.soundOverload + r.sensory.lightOverload + r.sensory.socialOverload + r.sensory.infoOverload, 0) / n,
      tension: ss.reduce((s, r) => s + r.body.physicalTension, 0) / n,
      behaviors: [...new Set(ss.flatMap((s) => Object.entries(s.behavior).filter(([, v]) => v).map(([k]) => k)))],
    };
  });
}

/** 3天：短期连续变化 */
function findShortTermPatterns(): Pattern[] {
  const sessions = getAllSessions();
  const daily = dailyAvgSessions(sessions);
  if (daily.length < 3) return [];

  const patterns: Pattern[] = [];
  const recent = daily.slice(-3); // 最近有数据的3天
  const d0 = recent[0], d1 = recent[1], d2 = recent[2];

  // 思考速度连续变化（≥1 即触发）
  const cpuChange = d2.thinkingSpeed - d0.thinkingSpeed;
  if (cpuChange >= 1) {
    patterns.push({
      type: 'short_term',
      title: '思考速度持续上升',
      description: `从 ${d0.date} 到 ${d2.date}，思考速度从 ${d0.thinkingSpeed.toFixed(1)} 升至 ${d2.thinkingSpeed.toFixed(1)}。共 ${recent.reduce((s, d) => s + d.sessions, 0)} 次签到。`,
    });
  } else if (cpuChange <= -1) {
    patterns.push({
      type: 'short_term',
      title: '思考速度持续下降',
      description: `从 ${d0.date} 到 ${d2.date}，思考速度从 ${d0.thinkingSpeed.toFixed(1)} 降至 ${d2.thinkingSpeed.toFixed(1)}。`,
    });
  }

  // 精力变化
  const energyChange = d2.energy - d0.energy;
  if (energyChange >= 1) {
    patterns.push({
      type: 'short_term',
      title: '精力回升',
      description: `从 ${d0.date} 到 ${d2.date}，精力从 ${d0.energy.toFixed(1)} 升至 ${d2.energy.toFixed(1)}。`,
    });
  } else if (energyChange <= -1) {
    patterns.push({
      type: 'short_term',
      title: '精力持续下降',
      description: `从 ${d0.date} 到 ${d2.date}，精力从 ${d0.energy.toFixed(1)} 降至 ${d2.energy.toFixed(1)}。`,
    });
  }

  // 感官负荷
  const sensoryChange = d2.sensory - d0.sensory;
  if (sensoryChange >= 3) {
    patterns.push({
      type: 'short_term',
      title: '感官负荷持续上升',
      description: `从 ${d0.date} 到 ${d2.date}，感官负荷从 ${d0.sensory.toFixed(1)} 升至 ${d2.sensory.toFixed(1)}。`,
    });
  }

  // 无显著变化时也给出反馈
  if (patterns.length === 0) {
    patterns.push({
      type: 'short_term',
      title: '短期状态稳定',
      description: `最近3天（${d0.date} ~ ${d2.date}）各项指标波动较小，未检测到显著的短期变化。这是正常状态——神经系统没有突然的剧烈波动。`,
    });
  }

  return patterns;
}

/** 7天：趋势偏离 */
function findTrendPatterns(): Pattern[] {
  const daily = dailyAvgSessions(getAllSessions()).filter((d) => {
    // 只看最近有数据的日子
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(d.date) >= sevenDaysAgo;
  });
  if (daily.length < 3) return [];

  const patterns: Pattern[] = [];

  const avgCPU = daily.reduce((s, d) => s + d.thinkingSpeed, 0) / daily.length;
  const avgEnergy = daily.reduce((s, d) => s + d.energy, 0) / daily.length;
  const avgSensory = daily.reduce((s, d) => s + d.sensory, 0) / daily.length;

  const last3 = daily.slice(-3);

  // 检查最近3天是否全面高于均值
  const highCPU = last3.filter((d) => d.thinkingSpeed > avgCPU + 0.5).length;
  const highSensory = last3.filter((d) => d.sensory > avgSensory + 2).length;
  const lowEnergy = last3.filter((d) => d.energy < avgEnergy - 0.5).length;

  if (highSensory >= 2) {
    patterns.push({
      type: 'trend',
      title: '感官负荷持续偏高',
      description: `过去 ${highSensory} 天感官负荷高于7天均值 ${avgSensory.toFixed(1)}。`,
    });
  }

  if (highCPU >= 2) {
    patterns.push({
      type: 'trend',
      title: '思考速度持续偏高',
      description: `过去 ${highCPU} 天思考速度高于7天均值 ${avgCPU.toFixed(1)}。`,
    });
  }

  if (lowEnergy >= 2) {
    patterns.push({
      type: 'trend',
      title: '精力持续偏低',
      description: `过去 ${lowEnergy} 天精力低于7天均值 ${avgEnergy.toFixed(1)}。`,
    });
  }

  if (patterns.length === 0) {
    patterns.push({
      type: 'trend',
      title: '趋势平稳',
      description: `过去7天（${daily.length} 天数据）各指标在正常范围内波动，未检测到明显的持续性偏离。`,
    });
  }

  return patterns;
}

/** 30天：关联规则 */
function findCorrelationPatterns(): Pattern[] {
  const daily = dailyAvgSessions(getAllSessions()).filter((d) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(d.date) >= thirtyDaysAgo;
  });
  if (daily.length < 7) return [];

  const patterns: Pattern[] = [];

  // 高CPU与高感官的关联
  let highCpuDays = 0, highCpuWithSensory = 0;
  daily.forEach((d) => {
    if (d.thinkingSpeed >= 3.5) {
      highCpuDays++;
      if (d.sensory >= 6) highCpuWithSensory++;
    }
  });

  if (highCpuDays >= 3) {
    const rate = Math.round((highCpuWithSensory / highCpuDays) * 100);
    if (rate >= 50) {
      patterns.push({
        type: 'correlation',
        title: '高CPU伴随感官负荷',
        description: `过去30天中，${rate}% 的高思考速度日（≥3.5）同时出现了高感官负荷（≥6）。共 ${highCpuDays} 个高CPU日。`,
      });
    }
  }

  // 检查行为触发频率
  const behaviorDays = new Map<string, number>();
  daily.forEach((d) => {
    d.behaviors.forEach((b) => {
      behaviorDays.set(b, (behaviorDays.get(b) ?? 0) + 1);
    });
  });
  const top = [...behaviorDays.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (top.length > 0 && top[0][1] >= 3) {
    patterns.push({
      type: 'correlation',
      title: '高频行为',
      description: top.map(([name, count]) => `"${getBehaviorLabel(name)}" 出现 ${count} 天（${Math.round((count / daily.length) * 100)}%）`).join('\n'),
    });
  }

  if (patterns.length === 0) {
    patterns.push({
      type: 'correlation',
      title: '关联数据积累中',
      description: `过去30天有 ${daily.length} 天数据。随着数据增多，系统将自动发现指标间的关联模式。`,
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
        .map(([name, count], i) => `${i + 1}. ${getBehaviorLabel(name)}（${count}次）`)
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

import { useState, useMemo } from 'react';
import { getAllSessions } from '../../lib/storage';
import { getBehaviorLabel } from '../../hooks/useBehaviors';

type TimeScale = 3 | 7 | 30 | 90 | -1;

const scaleLabels: { scale: TimeScale; label: string }[] = [
  { scale: 3, label: '3天' }, { scale: 7, label: '7天' }, { scale: 30, label: '30天' }, { scale: 90, label: '90天' }, { scale: -1, label: '全部' },
];

interface Pattern {
  type: 'short_term' | 'trend' | 'correlation' | 'cycle' | 'signature';
  title: string;
  description: string;
}

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
      <div className="flex gap-1 rounded-lg bg-panel-hover p-0.5">
        {scaleLabels.map(({ scale: s, label }) => (
          <button key={s} onClick={() => setScale(s)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${scale === s ? 'bg-panel-card text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {patterns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-mono text-sm text-slate-500">数据不足</p>
          <p className="mt-1 text-xs text-slate-600">需要更多记录来发现这个时间尺度的规律</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patterns.map((p, i) => (
            <div key={i} className="rounded-xl border border-panel-border bg-panel-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 rounded bg-panel-hover px-1.5 py-0.5">
                  {p.type === 'short_term' ? '短期' : p.type === 'trend' ? '趋势' : p.type === 'correlation' ? '关联' : p.type === 'cycle' ? '周期' : '特征'}
                </span>
                <h4 className="text-sm font-medium text-slate-200">{p.title}</h4>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-slate-400">{p.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== 每日均值计算 ======

function dailyAvgs(sessions: ReturnType<typeof getAllSessions>) {
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
      thinkingSpeed: +(ss.reduce((s, r) => s + r.brain.thinkingSpeed, 0) / n).toFixed(1),
      energy: +(ss.reduce((s, r) => s + r.body.energy, 0) / n).toFixed(1),
      sensory: +(ss.reduce((s, r) => s + r.sensory.soundOverload + r.sensory.lightOverload + r.sensory.socialOverload + r.sensory.infoOverload, 0) / n).toFixed(1),
      tension: +(ss.reduce((s, r) => s + r.body.physicalTension, 0) / n).toFixed(1),
      behaviors: [...new Set(ss.flatMap((s) => Object.entries(s.behavior).filter(([, v]) => v).map(([k]) => k)))],
    };
  });
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ====== 3天：短期变化 ======

function findShortTermPatterns(): Pattern[] {
  const sessions = getAllSessions();
  // 过滤可能的 0 值缺失数据
  const valid = sessions.filter((s) => s.brain.thinkingSpeed > 0 && s.body.energy > 0);
  const daily = dailyAvgs(valid);
  if (daily.length < 3) return [{ type: 'short_term', title: '数据还不够', description: '需要至少3天有效数据（CPU和精力不能是0）。目前共' + daily.length + '天。' }];

  const patterns: Pattern[] = [];
  const recent = daily.slice(-3);
  const d0 = recent[0], d2 = recent[2];

  // CPU 变化
  const cpuChange = +(d2.thinkingSpeed - d0.thinkingSpeed).toFixed(1);
  if (Math.abs(cpuChange) >= 1) {
    const dir = cpuChange > 0 ? '上升' : '下降';
    patterns.push({
      type: 'short_term',
      title: `CPU ${dir === '上升' ? '↑' : '↓'}（${formatDateLabel(d0.date)} → ${formatDateLabel(d2.date)}）`,
      description: `从 ${d0.thinkingSpeed} 变到 ${d2.thinkingSpeed}，变化了 ${Math.abs(cpuChange)}。中间${d0.sessions + recent[1].sessions + d2.sessions}次记录。不过这3天的数据还不能判断是不是趋势——可能只是正常波动。`,
    });
  }

  // 精力变化
  const energyChange = +(d2.energy - d0.energy).toFixed(1);
  if (Math.abs(energyChange) >= 1) {
    const dir = energyChange > 0 ? '回升' : '下降';
    patterns.push({
      type: 'short_term',
      title: `精力${dir}（${formatDateLabel(d0.date)} → ${formatDateLabel(d2.date)}）`,
      description: `从 ${d0.energy} 变到 ${d2.energy}。目前只有3天数据，暂时不能确定是不是持续${dir}趋势。`,
    });
  }

  // 感官变化
  const sensoryChange = +(d2.sensory - d0.sensory).toFixed(1);
  if (Math.abs(sensoryChange) >= 2) {
    const dir = sensoryChange > 0 ? '变高' : '变低';
    patterns.push({
      type: 'short_term',
      title: `感官负荷${dir}（${formatDateLabel(d0.date)} → ${formatDateLabel(d2.date)}）`,
      description: `从 ${d0.sensory} 变到 ${d2.sensory}。`,
    });
  }

  if (patterns.length === 0) {
    patterns.push({
      type: 'short_term',
      title: '短期状态稳定',
      description: `从${formatDateLabel(d0.date)}到${formatDateLabel(d2.date)}，各项指标变化不大。这通常是好事——说明神经系统没有剧烈波动。`,
    });
  }

  return patterns;
}

// ====== 7天：趋势 ======

function findTrendPatterns(): Pattern[] {
  const sessions = getAllSessions().filter((s) => s.brain.thinkingSpeed > 0 && s.body.energy > 0);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const daily = dailyAvgs(sessions).filter((d) => new Date(d.date) >= sevenDaysAgo);
  if (daily.length < 3) return [{ type: 'trend', title: '数据还不够', description: `最近7天只有 ${daily.length} 天有效数据。` }];

  const patterns: Pattern[] = [];
  const avgCPU = +(daily.reduce((s, d) => s + d.thinkingSpeed, 0) / daily.length).toFixed(1);
  const avgEnergy = +(daily.reduce((s, d) => s + d.energy, 0) / daily.length).toFixed(1);
  const avgSensory = +(daily.reduce((s, d) => s + d.sensory, 0) / daily.length).toFixed(1);

  const last3 = daily.slice(-3);
  const highCPU = last3.filter((d) => d.thinkingSpeed > avgCPU + 0.5).length;
  const highSensory = last3.filter((d) => d.sensory > avgSensory + 2).length;
  const lowEnergy = last3.filter((d) => d.energy < avgEnergy - 0.5).length;

  if (highSensory >= 2) {
    patterns.push({
      type: 'trend',
      title: '感官负荷最近偏高',
      description: `最近3天中有 ${highSensory} 天的感官负荷高于7天平均值 ${avgSensory}。不过只有7天数据，暂时不能确定是不是持续趋势。`,
    });
  }
  if (highCPU >= 2) {
    patterns.push({
      type: 'trend',
      title: 'CPU 最近偏高',
      description: `最近3天中有 ${highCPU} 天的 CPU 高于7天均值 ${avgCPU}。`,
    });
  }
  if (lowEnergy >= 2) {
    patterns.push({
      type: 'trend',
      title: '精力最近偏低',
      description: `最近3天中有 ${lowEnergy} 天的精力低于7天均值 ${avgEnergy}。`,
    });
  }

  if (patterns.length === 0) {
    patterns.push({
      type: 'trend',
      title: '趋势平稳',
      description: `过去7天（${daily.length} 天数据）各指标在正常范围内，没有明显持续偏离。`,
    });
  }

  return patterns;
}

// ====== 30天：关联 ======

function findCorrelationPatterns(): Pattern[] {
  const sessions = getAllSessions().filter((s) => s.brain.thinkingSpeed > 0 && s.body.energy > 0);
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const daily = dailyAvgs(sessions).filter((d) => new Date(d.date) >= thirtyDaysAgo);
  if (daily.length < 7) return [{ type: 'correlation', title: '数据还不够', description: `最近30天只有 ${daily.length} 天有效数据，至少需要7天。` }];

  const patterns: Pattern[] = [];

  // 高感官 + 低CPU/精力 的同日出现
  let highSensoryDays = 0, highSensoryLowCPU = 0, highSensoryLowEnergy = 0;
  daily.forEach((d) => {
    if (d.sensory >= 8) {
      highSensoryDays++;
      if (d.thinkingSpeed <= 2.5) highSensoryLowCPU++;
      if (d.energy <= 2.5) highSensoryLowEnergy++;
    }
  });

  if (highSensoryDays >= 3) {
    patterns.push({
      type: 'correlation',
      title: '感官高的时候，CPU 和精力也容易偏低',
      description: `${highSensoryDays} 天感官负荷较高（≥8）的日子里，有 ${highSensoryLowCPU} 天 CPU 同时偏低、${highSensoryLowEnergy} 天精力同时偏低。这只是同一天的数据，不能说是感官负荷直接造成的——只能说它们经常一起出现。`,
    });
  }

  // 高频行为
  const behaviorDays = new Map<string, number>();
  daily.forEach((d) => { d.behaviors.forEach((b) => { behaviorDays.set(b, (behaviorDays.get(b) ?? 0) + 1); }); });
  const top = [...behaviorDays.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (top.length > 0 && top[0][1] >= 3) {
    patterns.push({
      type: 'correlation',
      title: '出现最多的行为',
      description: top.map(([name, count]) => `"${getBehaviorLabel(name)}" 出现 ${count} 天（30天里占 ${Math.round((count / daily.length) * 100)}%）`).join('\n') + '\n\n这只能说明这些行为出现频率较高，不能说明它们和其他指标有关系。',
    });
  }

  if (patterns.length === 0) {
    patterns.push({ type: 'correlation', title: '关联还在积累', description: `过去30天有 ${daily.length} 天数据。数据多了以后系统能发现更多关联。` });
  }

  return patterns;
}

// ====== 90天：周期 ======

function findCyclePatterns(): Pattern[] {
  const sessions = getAllSessions().filter((s) => s.brain.thinkingSpeed > 0);
  if (sessions.length < 20) return [{ type: 'cycle', title: '数据还不够', description: '需要更多记录才能观察周期性的规律。目前共' + sessions.length + '次有效签到。' }];

  const highCpuDates = new Set<string>();
  const byDate = new Map<string, number[]>();
  sessions.forEach((s) => { const d = s.timestamp.slice(0, 10); if (!byDate.has(d)) byDate.set(d, []); byDate.get(d)!.push(s.brain.thinkingSpeed); });
  byDate.forEach((speeds, date) => { if (speeds.reduce((a, b) => a + b, 0) / speeds.length >= 3.5) highCpuDates.add(date); });

  const sorted = [...highCpuDates].sort();
  if (sorted.length < 3) return [{ type: 'cycle', title: '暂未发现明显周期', description: `高 CPU 的天数还不够多（${sorted.length} 天），暂时看不出周期性的规律。` }];

  const patterns: Pattern[] = [];

  // 计算间隔
  if (sorted.length >= 3) {
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000);
    }
    // 检查是否有规律间隔（所有间隔标准差小）
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((s, g) => s + (g - avgGap) ** 2, 0) / gaps.length;
    if (variance < avgGap * 0.5 && sorted.length >= 4) {
      patterns.push({
        type: 'cycle',
        title: `高 CPU 日大约每隔 ${Math.round(avgGap)} 天出现`,
        description: `过去90天出现了 ${sorted.length} 次高 CPU 日（≥3.5），间隔大约 ${Math.round(avgGap)} 天。但这只是统计规律，不一定代表生理周期——样本量还比较小。`,
      });
    } else {
      patterns.push({
        type: 'cycle',
        title: '高 CPU 日的间隔不太规律',
        description: `90天里出现 ${sorted.length} 次高 CPU 日，但时间间隔不太固定（从 ${Math.round(Math.min(...gaps))} 天到 ${Math.round(Math.max(...gaps))} 天）。可能需要更长时间的数据才能判断有无周期。`,
      });
    }
  }

  return patterns;
}

// ====== All Time：个人特征 ======

function findSignaturePatterns(): Pattern[] {
  const sessions = getAllSessions().filter((s) => s.brain.thinkingSpeed > 0);
  if (sessions.length < 20) return [{ type: 'signature', title: '数据还不够', description: `目前共 ${sessions.length} 次有效签到，需要更多记录才能总结个人规律。` }];

  const patterns: Pattern[] = [];

  // Top 行为
  const behaviorCounts = new Map<string, number>();
  sessions.forEach((s) => { Object.entries(s.behavior).filter(([, v]) => v).forEach(([k]) => behaviorCounts.set(k, (behaviorCounts.get(k) ?? 0) + 1)); });
  const topBehaviors = [...behaviorCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (topBehaviors.length > 0) {
    patterns.push({
      type: 'signature',
      title: '出现最多的 5 个行为',
      description: topBehaviors.map(([name, count], i) => `${i + 1}. ${getBehaviorLabel(name)}（${count}次）`).join('\n') + '\n\n这列出了你最容易注意到的行为变化。记住这不代表因果关系——只是说明你经常注意到它们。',
    });
  }

  // 数据概览
  const totalDays = new Set(sessions.map((s) => s.timestamp.slice(0, 10))).size;
  patterns.push({
    type: 'signature',
    title: '你的数据概览',
    description: `共 ${totalDays} 天，${sessions.length} 次签到，平均每天 ${(sessions.length / Math.max(totalDays, 1)).toFixed(1)} 次。这只是统计数字，不是评价——记录频率本身也在反映你的状态变化。`,
  });

  return patterns;
}

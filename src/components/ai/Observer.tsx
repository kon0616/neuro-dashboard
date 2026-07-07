import { Moon, Calendar, Tag } from 'lucide-react';
import type { DayRecord } from '../../types/day';
import { periodLabels } from '../../types/session';
import { getBehaviorLabel } from '../../hooks/useBehaviors';
import { getEventLabel } from '../../hooks/useEvents';

interface ObserverProps {
  day: DayRecord | null;
}

/**
 * AI Observer — 今日事实摘要
 * 纯数据聚合，无解释、无建议、无诊断
 */
export function Observer({ day }: ObserverProps) {
  if (!day || day.sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="font-mono text-sm text-slate-500">今天还没有记录</p>
        <p className="mt-1 text-xs text-slate-600">开始签到后这里会自动生成今日摘要</p>
      </div>
    );
  }

  const sessions = day.sessions;
  const events = day.events;

  const totalSensory = (s: (typeof sessions)[0]) =>
    s.sensory.soundOverload + s.sensory.lightOverload + s.sensory.socialOverload + s.sensory.infoOverload;

  // 收集行为
  const allBehaviors = new Set<string>();
  sessions.forEach((s) => {
    Object.entries(s.behavior)
      .filter(([, v]) => v)
      .forEach(([k]) => allBehaviors.add(getBehaviorLabel(k)));
  });

  // 事件列表
  const eventLabels = events.map((e) => getEventLabel(e.eventTypeId));

  return (
    <div className="space-y-4">
      {/* 摘要头部 */}
      <div className="rounded-xl border border-panel-border bg-panel-card p-4">
        <h3 className="mb-3 text-xs font-medium text-slate-400">今日摘要</h3>

        <div className="space-y-2 font-mono text-sm leading-relaxed text-slate-300">
          {/* 会话数 */}
          <p>
            今天进行了{' '}
            <span className="text-blue-400 font-semibold">{sessions.length}</span>{' '}
            次记录。
          </p>

          {/* 时段分布 */}
          <p className="text-xs text-slate-500">
            {sessions.map((s, i) => (
              <span key={s.id}>
                {periodLabels[s.period]}
                {i < sessions.length - 1 && ' → '}
              </span>
            ))}
          </p>

          {/* 趋势变化 */}
          {sessions.length >= 2 && (
            <div className="mt-3 space-y-1 rounded-lg bg-panel-hover/50 p-3">
              <MetricChange
                label="CPU"
                color="text-blue-400"
                values={sessions.map((s) => s.brain.thinkingSpeed)}
              />
              <MetricChange
                label="Energy"
                color="text-green-400"
                values={sessions.map((s) => s.body.energy)}
              />
              <MetricChange
                label="Sensory"
                color="text-amber-400"
                values={sessions.map((s) => totalSensory(s))}
              />
              <MetricChange
                label="Tension"
                color="text-red-400"
                values={sessions.map((s) => s.body.physicalTension)}
              />
            </div>
          )}

          {/* 睡眠 */}
          {day.sleep && (
            <p className="text-xs text-slate-500">
              <Moon className="inline h-3 w-3 mr-1 text-indigo-400" />
              睡眠：{day.sleep.hours}h / 质量 {day.sleep.quality}/5
            </p>
          )}

          {/* 事件 */}
          {events.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                今日事件：
              </p>
              <div className="flex flex-wrap gap-1">
                {eventLabels.map((label, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 行为 */}
          {allBehaviors.size > 0 && (
            <div className="mt-2">
              <p className="text-xs text-slate-400 mb-1">
                <Tag className="inline h-3 w-3 mr-1" />
                今日行为：
              </p>
              <div className="flex flex-wrap gap-1">
                {[...allBehaviors].map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-[10px] text-slate-600 border-t border-panel-border pt-3">
          Observer v1 — 仅事实陈述，无解释或建议
        </p>
      </div>
    </div>
  );
}

/** 指标变化行 */
function MetricChange({
  label,
  color,
  values,
}: {
  label: string;
  color: string;
  values: number[];
}) {
  const trend =
    values[values.length - 1] > values[0]
      ? '↑'
      : values[values.length - 1] < values[0]
      ? '↓'
      : '→';

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={color + ' w-16'}>{label}</span>
      <span className="text-slate-500">
        {values.map((v, i) => (
          <span key={i}>
            {v}
            {i < values.length - 1 && ' → '}
          </span>
        ))}
      </span>
      <span
        className={
          trend === '↑'
            ? 'text-red-400'
            : trend === '↓'
            ? 'text-blue-400'
            : 'text-slate-500'
        }
      >
        {trend}
      </span>
    </div>
  );
}

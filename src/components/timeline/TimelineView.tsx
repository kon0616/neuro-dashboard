import { useState } from 'react';
import { Cpu, Battery, Radio, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { getBehaviorLabel } from '../../hooks/useBehaviors';
import type { DayRecord } from '../../types/day';
import type { Session } from '../../types/session';
import type { AppEvent } from '../../types/event';
import { periodLabels } from '../../types/session';
import { useTimeline, type TimelineEntry } from '../../hooks/useTimeline';
import { useDay } from '../../hooks/useDay';
import { DayNavigator } from './DayNavigator';
import { getToday } from '../../lib/utils';
import { deleteSession } from '../../lib/storage';
import { deleteEvent } from '../../lib/storage';

/**
 * 时间线视图 — 垂直时间线 + 日内指标变化
 */
export function TimelineView() {
  const [date, setDate] = useState(getToday());
  const { day, isLoaded, refresh } = useDay(date);
  const entries = useTimeline(day);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-sm text-slate-500">加载中...</p>
      </div>
    );
  }

  const hasData = day && (day.sessions.length > 0 || day.events.length > 0);

  return (
    <div className="space-y-4 pb-4">
      <DayNavigator date={date} onChange={setDate} />

      {!hasData && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="font-mono text-sm text-slate-500">当天无数据</p>
          <p className="mt-1 text-xs text-slate-600">
            返回仪表盘记录今天的神经状态
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* 日内指标概览图 */}
          {day.sessions.length >= 2 && (
            <TimelineChart sessions={day.sessions} />
          )}

          {/* 垂直时间线 */}
          <div className="rounded-xl border border-panel-border bg-panel-card p-4">
            <h3 className="mb-4 text-sm font-medium text-slate-200">时间线</h3>

            <div className="relative pl-6">
              {/* 垂直连线 */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-panel-border" />

              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <TimelineNode
                    key={`${entry.kind}-${entry.data.id}`}
                    entry={entry}
                    isLast={i === entries.length - 1}
                    onDelete={() => {
                      if (entry.kind === 'session') {
                        deleteSession(date, entry.data.id);
                      } else {
                        deleteEvent(date, entry.data.id);
                      }
                      refresh();
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** 时间线节点 */
function TimelineNode({ entry, isLast, onDelete }: { entry: TimelineEntry; isLast: boolean; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(entry.data.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (entry.kind === 'session') {
    const s = entry.data;
    const totalSensory =
      s.sensory.soundOverload + s.sensory.lightOverload + s.sensory.socialOverload + s.sensory.infoOverload;

    return (
      <div className="relative">
        {/* 节点圆点 */}
        <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-panel-bg bg-blue-400" />

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full rounded-lg bg-panel-hover/50 px-3 py-2 text-left hover:bg-panel-hover transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500">{time}</span>
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">
              {periodLabels[s.period]}
            </span>
            <span className="text-[10px] text-slate-500">签到</span>

            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              <Cpu className="h-3 w-3" />{s.brain.thinkingSpeed}
              <Battery className="h-3 w-3" />{s.body.energy}
              <Radio className="h-3 w-3" />{totalSensory}
            </span>
            {expanded ? <ChevronDown className="h-3 w-3 text-slate-600" /> : <ChevronRight className="h-3 w-3 text-slate-600" />}
          </div>
        </button>

        {/* 展开详情 */}
        {expanded && (
          <div className="mt-2 ml-4 space-y-1 rounded-lg bg-panel-hover/30 p-3 text-xs">
            <Row label="思考速度" value={`${s.brain.thinkingSpeed}/5`} />
            <Row label="新想法" value={s.brain.newIdeas} />
            <Row label="精力" value={`${s.body.energy}/5`} />
            <Row label="睡眠" value={`${s.body.sleepHours}h`} />
            <Row label="感官总负荷" value={`${totalSensory}/20`} />
            <Row label="屏幕时间" value={`${s.environment.screenTime}h`} />
            {s.note && <Row label="备注" value={s.note} />}
            {Object.entries(s.behavior).filter(([, v]) => v).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {Object.entries(s.behavior).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">{getBehaviorLabel(k)}</span>
                ))}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="mt-1 text-[10px] text-slate-600 hover:text-red-400 transition-colors"
            >
              删除
            </button>
          </div>
        )}
      </div>
    );
  }

  // Event node
  return (
    <div className="relative">
      <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-panel-bg bg-amber-400" />

      <div className="rounded-lg bg-panel-hover/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-500">{time}</span>
          <Circle className="h-2.5 w-2.5 text-amber-400" />
          <span className="text-[10px] text-slate-400">{entry.label}</span>
          {entry.data.note && (
            <span className="text-[10px] text-slate-600 truncate max-w-[150px]">{entry.data.note}</span>
          )}
          <button
            onClick={onDelete}
            className="ml-auto text-[10px] text-slate-600 hover:text-red-400 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

/** 详情行 */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-300">{value}</span>
    </div>
  );
}

/** 日内指标变化图 */
function TimelineChart({ sessions }: { sessions: Session[] }) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel-card p-4">
      <h3 className="mb-3 text-xs font-medium text-slate-400">日内变化</h3>
      <div className="space-y-2">
        {sessions.map((s, i) => {
          const time = new Date(s.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const totalSensory =
            s.sensory.soundOverload + s.sensory.lightOverload + s.sensory.socialOverload + s.sensory.infoOverload;

          return (
            <div key={s.id} className="flex items-center gap-3">
              <span className="w-10 font-mono text-[10px] text-slate-500">{time}</span>

              <div className="flex-1 space-y-1">
                {/* 思考速度条 */}
                <div className="flex items-center gap-1">
                  <span className="w-5 text-[9px] text-blue-400">CPU</span>
                  <div className="flex-1 h-1 rounded-full bg-panel-hover">
                    <div
                      className="h-full rounded-full bg-metric-cpu transition-all"
                      style={{ width: `${(s.brain.thinkingSpeed / 5) * 100}%` }}
                    />
                  </div>
                </div>
                {/* 精力条 */}
                <div className="flex items-center gap-1">
                  <span className="w-5 text-[9px] text-green-400">BAT</span>
                  <div className="flex-1 h-1 rounded-full bg-panel-hover">
                    <div
                      className="h-full rounded-full bg-metric-battery transition-all"
                      style={{ width: `${(s.body.energy / 5) * 100}%` }}
                    />
                  </div>
                </div>
                {/* 感官条 */}
                <div className="flex items-center gap-1">
                  <span className="w-5 text-[9px] text-amber-400">SEN</span>
                  <div className="flex-1 h-1 rounded-full bg-panel-hover">
                    <div
                      className="h-full rounded-full bg-metric-sensor transition-all"
                      style={{ width: `${(totalSensory / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

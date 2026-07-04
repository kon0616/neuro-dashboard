import { Cpu, Battery, Radio, Thermometer, Clock, Trash2 } from 'lucide-react';
import type { Session } from '../../types/session';
import { periodLabels } from '../../types/session';

interface TodaySummaryProps {
  sessions: Session[];
  onDelete: (sessionId: string) => void;
}

/**
 * 今日已签到会话摘要列表
 */
export function TodaySummary({ sessions, onDelete }: TodaySummaryProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="rounded-xl border border-panel-border bg-panel-card p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-200">
        今日签到 ({sessions.length})
      </h3>
      <div className="space-y-2">
        {sessions.map((s) => {
          const totalSensory =
            s.sensory.soundOverload +
            s.sensory.lightOverload +
            s.sensory.socialOverload +
            s.sensory.infoOverload;

          return (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-lg bg-panel-hover/50 px-3 py-2"
            >
              <span className="w-12 text-[10px] font-mono text-slate-500">
                {new Date(s.timestamp).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="rounded bg-panel-border px-1.5 py-0.5 text-[10px] text-slate-400">
                {periodLabels[s.period]}
              </span>

              <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-500">
                <Cpu className="h-3 w-3" />{s.brain.thinkingSpeed}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-500">
                <Battery className="h-3 w-3" />{s.body.energy}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-500">
                <Radio className="h-3 w-3" />{totalSensory}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-500">
                <Thermometer className="h-3 w-3" />{s.body.physicalTension}
              </span>

              {s.note && (
                <span className="ml-auto truncate text-[10px] text-slate-600 max-w-[120px]">
                  {s.note}
                </span>
              )}

              <button
                onClick={() => onDelete(s.id)}
                className="ml-auto rounded p-1 text-slate-600 hover:text-red-400 transition-colors"
                aria-label="删除此签到"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

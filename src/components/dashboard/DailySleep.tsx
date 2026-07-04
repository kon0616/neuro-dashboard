import { Moon } from 'lucide-react';

interface DailySleepProps {
  hours: number;
  quality: number;
  onHoursChange: (h: number) => void;
  onQualityChange: (q: number) => void;
}

/**
 * 睡眠卡片 — 每天只记录一次
 */
export function DailySleep({ hours, quality, onHoursChange, onQualityChange }: DailySleepProps) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
          <Moon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-medium text-slate-200">睡眠</h3>
          <p className="text-[11px] text-slate-500">每天记录一次</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* 睡眠时长 */}
        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-xs text-slate-400">睡眠时长</span>
            <span className="font-mono text-xs text-slate-500">{hours}h</span>
          </div>
          <input
            type="range"
            min={0}
            max={14}
            step={0.5}
            value={hours}
            onChange={(e) => onHoursChange(Number(e.target.value))}
            className="w-full"
            aria-label="睡眠时长"
          />
        </div>

        {/* 睡眠质量 */}
        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-xs text-slate-400">睡眠质量</span>
            <span className="font-mono text-xs text-slate-500">{quality}/5</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="w-full"
            aria-label="睡眠质量"
          />
          <div className="mt-0.5 flex justify-between text-[10px] text-slate-600">
            <span>很差</span>
            <span>很好</span>
          </div>
        </div>
      </div>
    </div>
  );
}

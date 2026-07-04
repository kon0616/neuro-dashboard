import { cn } from '../../lib/utils';

interface TimeRangeToggleProps {
  range: 7 | 30;
  onChange: (range: 7 | 30) => void;
}

/**
 * 7天 / 30天 切换按钮
 */
export function TimeRangeToggle({ range, onChange }: TimeRangeToggleProps) {
  return (
    <div className="flex rounded-lg border border-panel-border bg-panel-hover p-0.5">
      {([7, 30] as const).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            range === r
              ? 'bg-panel-card text-slate-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          {r} 天
        </button>
      ))}
    </div>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DayNavigatorProps {
  date: string;
  onChange: (date: string) => void;
}

/**
 * 日期导航器 — 前一天/后一天/今天
 */
export function DayNavigator({ date, onChange }: DayNavigatorProps) {
  const current = new Date(date);

  const goPrev = () => {
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    onChange(prev.toISOString().slice(0, 10));
  };

  const goNext = () => {
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    const today = new Date().toISOString().slice(0, 10);
    if (next.toISOString().slice(0, 10) <= today) {
      onChange(next.toISOString().slice(0, 10));
    }
  };

  const goToday = () => {
    onChange(new Date().toISOString().slice(0, 10));
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = date === todayStr;

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={goPrev}
        className="rounded-lg p-2 text-slate-500 hover:text-slate-300 hover:bg-panel-hover transition-colors min-h-touch"
        aria-label="前一天"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={goToday}
        className={cn(
          'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
          isToday
            ? 'text-blue-400'
            : 'text-slate-400 hover:text-slate-200'
        )}
      >
        {new Date(date).toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })}
        {isToday && <span className="ml-1 text-[10px] text-blue-500">今天</span>}
      </button>

      <button
        onClick={goNext}
        disabled={isToday}
        className={cn(
          'rounded-lg p-2 transition-colors min-h-touch',
          isToday
            ? 'text-slate-700 cursor-not-allowed'
            : 'text-slate-500 hover:text-slate-300 hover:bg-panel-hover'
        )}
        aria-label="后一天"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

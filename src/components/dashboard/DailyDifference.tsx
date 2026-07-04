import { Edit3 } from 'lucide-react';

interface DailyDifferenceProps {
  value: string;
  onChange: (text: string) => void;
}

/**
 * "今天有什么不同？" — 一句话输入
 */
export function DailyDifference({ value, onChange }: DailyDifferenceProps) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Edit3 className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-200">
          今天有什么不同？
        </h3>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='一句话就好，比如："灯光感觉特别亮"'
        maxLength={200}
        className="w-full rounded-lg border border-panel-border bg-panel-hover px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
      />
      <p className="mt-1 text-[10px] text-slate-600">
        不需要解释情绪。观察到的变化即可。
      </p>
    </div>
  );
}

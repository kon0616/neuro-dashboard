import { ListChecks } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { BehaviorFlags } from '../../types';

interface BehaviorCardProps {
  data: BehaviorFlags;
  onChange: (update: Partial<BehaviorFlags>) => void;
}

interface CheckItem {
  key: keyof BehaviorFlags;
  label: string;
}

const items: CheckItem[] = [
  { key: 'startedManyProjects', label: '启动多个新项目' },
  { key: 'talkedMuchMore', label: '话量显著增加' },
  { key: 'hyperfocused', label: '长时间高度专注' },
  { key: 'forgotMeals', label: '忘记吃饭' },
  { key: 'stayedUpLate', label: '熬夜' },
  { key: 'impulseSpending', label: '冲动消费' },
  { key: 'avoidedCommunication', label: '避免社交' },
  { key: 'stayedInBed', label: '大部分时间卧床' },
  { key: 'difficultyStartingTasks', label: '启动任务困难' },
];

/**
 * 行为标记卡片
 * 勾选今日发生的行为
 */
export function BehaviorCard({ data, onChange }: BehaviorCardProps) {
  const checkedCount = Object.values(data).filter(Boolean).length;

  return (
    <MetricCard
      title="行为"
      subtitle={`${checkedCount}/9 项标记`}
      icon={<ListChecks className="h-4 w-4" />}
    >
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {items.map((item) => (
          <label
            key={item.key}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors min-h-touch
              ${
                data[item.key]
                  ? 'bg-blue-500/10 border border-blue-500/20'
                  : 'bg-panel-hover/50 border border-transparent hover:bg-panel-hover'
              }`}
          >
            <input
              type="checkbox"
              className="toggle-check"
              checked={data[item.key]}
              onChange={(e) =>
                onChange({ [item.key]: e.target.checked })
              }
            />
            <span
              className={`text-xs ${
                data[item.key] ? 'text-blue-300' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </MetricCard>
  );
}

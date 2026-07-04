import { Radio } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { SystemIndicator } from './SystemIndicator';
import type { SensoryMetrics } from '../../types';

interface SensoryCardProps {
  data: SensoryMetrics;
  onChange: (update: Partial<SensoryMetrics>) => void;
}

interface SensoryField {
  key: keyof SensoryMetrics;
  label: string;
  indicator: 'sensor' | 'bandwidth';
}

const fields: SensoryField[] = [
  { key: 'soundOverload', label: '声音过载', indicator: 'sensor' },
  { key: 'lightOverload', label: '光线过载', indicator: 'sensor' },
  { key: 'socialOverload', label: '社交过载', indicator: 'bandwidth' },
  { key: 'infoOverload', label: '信息过载', indicator: 'bandwidth' },
];

/**
 * 感官指标卡片
 * 传感器/带宽风格指示器
 */
export function SensoryCard({ data, onChange }: SensoryCardProps) {
  // 计算总感官负荷
  const totalLoad =
    data.soundOverload +
    data.lightOverload +
    data.socialOverload +
    data.infoOverload;
  const maxLoad = 20;

  return (
    <MetricCard
      title="感官"
      subtitle="环境刺激处理"
      icon={<Radio className="h-4 w-4" />}
    >
      {/* 总感官负荷 */}
      <SystemIndicator
        type="sensor"
        value={totalLoad}
        max={maxLoad}
        label="总负荷"
      />

      {/* 各感官指标 */}
      {fields.map((field) => (
        <div key={field.key}>
          <div className="mb-1 flex justify-between">
            <span className="text-xs text-slate-400">{field.label}</span>
            <span className="font-mono text-xs text-slate-500">
              {data[field.key]}/5
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={data[field.key]}
            onChange={(e) =>
              onChange({ [field.key]: Number(e.target.value) })
            }
            className="w-full"
            aria-label={field.label}
          />
          <div className="mt-0.5 flex justify-between text-[10px] text-slate-600">
            <span>正常</span>
            <span>过载</span>
          </div>
        </div>
      ))}
    </MetricCard>
  );
}

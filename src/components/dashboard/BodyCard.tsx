import { Battery } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { SystemIndicator } from './SystemIndicator';
import type { BodyMetrics } from '../../types';

interface BodyCardProps {
  data: BodyMetrics;
  onChange: (update: Partial<BodyMetrics>) => void;
}

interface SliderField {
  key: keyof BodyMetrics;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const sliders: SliderField[] = [
  { key: 'sleepHours', label: '睡眠时长', min: 0, max: 14, step: 0.5, unit: 'h' },
  { key: 'sleepQuality', label: '睡眠质量', min: 1, max: 5, step: 1, unit: '' },
  { key: 'energy', label: '精力', min: 1, max: 5, step: 1, unit: '' },
  { key: 'appetite', label: '食欲', min: 1, max: 5, step: 1, unit: '' },
  { key: 'physicalTension', label: '身体紧张度', min: 1, max: 5, step: 1, unit: '' },
];

/**
 * 身体指标卡片
 * 电池风格指示器 + 滑块
 */
export function BodyCard({ data, onChange }: BodyCardProps) {
  return (
    <MetricCard
      title="身体"
      subtitle="生理状态"
      icon={<Battery className="h-4 w-4" />}
    >
      {/* 精力 - 电池指示器 */}
      <SystemIndicator
        type="battery"
        value={data.energy}
        max={5}
        label="电量"
      />

      {/* 各指标滑块 */}
      {sliders.map((field) => (
        <div key={field.key}>
          <div className="mb-1 flex justify-between">
            <span className="text-xs text-slate-400">{field.label}</span>
            <span className="font-mono text-xs text-slate-500">
              {data[field.key]}
              {field.unit && (
                <span className="ml-0.5 text-[10px]">{field.unit}</span>
              )}
            </span>
          </div>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={data[field.key]}
            onChange={(e) =>
              onChange({ [field.key]: Number(e.target.value) })
            }
            className="w-full"
            aria-label={field.label}
          />
        </div>
      ))}
    </MetricCard>
  );
}

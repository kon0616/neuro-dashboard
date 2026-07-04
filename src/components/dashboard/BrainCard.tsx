import { Cpu } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { SystemIndicator } from './SystemIndicator';
import type { BrainMetrics } from '../../types';

interface BrainCardProps {
  data: BrainMetrics;
  onChange: (update: Partial<BrainMetrics>) => void;
}

const newIdeasOptions: { value: BrainMetrics['newIdeas']; label: string }[] = [
  { value: '0', label: '无' },
  { value: '1-3', label: '1~3' },
  { value: '4-10', label: '4~10' },
  { value: '10+', label: '10+' },
];

const stopThinkingOptions: { value: BrainMetrics['canStopThinking']; label: string }[] = [
  { value: 'yes', label: '可以' },
  { value: 'difficult', label: '困难' },
  { value: 'no', label: '不能' },
];

/**
 * 大脑/认知指标卡片
 * CPU 风格指示器 + 单选组
 */
export function BrainCard({ data, onChange }: BrainCardProps) {
  return (
    <MetricCard
      title="大脑"
      subtitle="认知状态"
      icon={<Cpu className="h-4 w-4" />}
    >
      {/* 思考速度 - CPU 指示器 */}
      <div>
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-slate-400">思考速度</span>
          <span className="font-mono text-xs text-slate-500">{data.thinkingSpeed}/5</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={data.thinkingSpeed}
          onChange={(e) => onChange({ thinkingSpeed: Number(e.target.value) })}
          className="w-full"
          aria-label="思考速度"
        />
        <div className="mt-0.5 flex justify-between text-[10px] text-slate-600">
          <span>很慢</span>
          <span>飞速</span>
        </div>
      </div>

      <SystemIndicator
        type="cpu"
        value={data.thinkingSpeed}
        max={5}
        label="CPU 负载"
      />

      {/* 新想法数量 */}
      <div>
        <span className="text-xs text-slate-400">新想法</span>
        <div className="mt-1.5 flex gap-1.5">
          {newIdeasOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ newIdeas: opt.value })}
              className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors min-h-touch
                ${
                  data.newIdeas === opt.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-panel-hover text-slate-400 border border-transparent hover:text-slate-300'
                }`}
              aria-pressed={data.newIdeas === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 活跃项目数 */}
      <div>
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-slate-400">活跃项目</span>
          <span className="font-mono text-xs text-slate-500">{data.activeProjects}</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={data.activeProjects}
          onChange={(e) => onChange({ activeProjects: Number(e.target.value) })}
          className="w-full"
          aria-label="活跃项目数"
        />
      </div>

      {/* 能否停止思考 */}
      <div>
        <span className="text-xs text-slate-400">能停止思考吗？</span>
        <div className="mt-1.5 flex gap-1.5">
          {stopThinkingOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ canStopThinking: opt.value })}
              className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors min-h-touch
                ${
                  data.canStopThinking === opt.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-panel-hover text-slate-400 border border-transparent hover:text-slate-300'
                }`}
              aria-pressed={data.canStopThinking === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </MetricCard>
  );
}

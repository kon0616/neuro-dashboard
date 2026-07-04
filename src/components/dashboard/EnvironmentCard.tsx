import { Thermometer } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { SystemIndicator } from './SystemIndicator';
import type { EnvironmentMetrics } from '../../types';

interface EnvironmentCardProps {
  data: EnvironmentMetrics;
  onChange: (update: Partial<EnvironmentMetrics>) => void;
}

/**
 * 环境指标卡片
 * 温度计风格指示器（压力）+ 数值滑块
 */
export function EnvironmentCard({ data, onChange }: EnvironmentCardProps) {
  return (
    <MetricCard
      title="环境"
      subtitle="外部因素"
      icon={<Thermometer className="h-4 w-4" />}
    >
      {/* 压力 - 温度指示器 */}
      <SystemIndicator
        type="temp"
        value={data.stress}
        max={5}
        label="压力温度"
      />

      {/* 压力滑块 */}
      <div>
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-slate-400">今日压力</span>
          <span className="font-mono text-xs text-slate-500">
            {data.stress}/5
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={data.stress}
          onChange={(e) => onChange({ stress: Number(e.target.value) })}
          className="w-full"
          aria-label="今日压力水平"
        />
        <div className="mt-0.5 flex justify-between text-[10px] text-slate-600">
          <span>低</span>
          <span>高</span>
        </div>
      </div>

      {/* 屏幕时间 */}
      <div>
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-slate-400">屏幕时间</span>
          <span className="font-mono text-xs text-slate-500">
            {data.screenTime}h
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="18"
          step="0.5"
          value={data.screenTime}
          onChange={(e) => onChange({ screenTime: Number(e.target.value) })}
          className="w-full"
          aria-label="屏幕使用时间"
        />
      </div>

      {/* 咖啡因 */}
      <div>
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-slate-400">咖啡因</span>
          <span className="font-mono text-xs text-slate-500">
            {data.caffeine} 杯
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={data.caffeine}
          onChange={(e) => onChange({ caffeine: Number(e.target.value) })}
          className="w-full"
          aria-label="咖啡因摄入量"
        />
      </div>

      {/* 运动 */}
      <div>
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-slate-400">运动</span>
          <span className="font-mono text-xs text-slate-500">
            {data.exercise}min
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="180"
          step="5"
          value={data.exercise}
          onChange={(e) => onChange({ exercise: Number(e.target.value) })}
          className="w-full"
          aria-label="运动时长"
        />
      </div>

      {/* 户外时间 */}
      <div>
        <div className="mb-1 flex justify-between">
          <span className="text-xs text-slate-400">户外时间</span>
          <span className="font-mono text-xs text-slate-500">
            {data.timeOutside}min
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="480"
          step="5"
          value={data.timeOutside}
          onChange={(e) => onChange({ timeOutside: Number(e.target.value) })}
          className="w-full"
          aria-label="户外活动时间"
        />
      </div>
    </MetricCard>
  );
}

import { cn } from '../../lib/utils';

interface SystemIndicatorProps {
  /** 指示器类型，决定颜色和图标隐喻 */
  type: 'cpu' | 'battery' | 'sensor' | 'bandwidth' | 'temp';
  /** 当前值 */
  value: number;
  /** 最大值 */
  max?: number;
  /** 标签 */
  label: string;
  /** 单位 */
  unit?: string;
  /** 尺寸 */
  size?: 'sm' | 'md';
}

const typeConfig = {
  cpu: {
    color: 'bg-metric-cpu',
    textColor: 'text-metric-cpu',
    label: 'CPU',
  },
  battery: {
    color: 'bg-metric-battery',
    textColor: 'text-metric-battery',
    label: 'BAT',
  },
  sensor: {
    color: 'bg-metric-sensor',
    textColor: 'text-metric-sensor',
    label: 'SEN',
  },
  bandwidth: {
    color: 'bg-metric-bandwidth',
    textColor: 'text-metric-bandwidth',
    label: 'BW',
  },
  temp: {
    color: 'bg-metric-temp',
    textColor: 'text-metric-temp',
    label: 'TMP',
  },
};

/**
 * 系统监视器风格的指示器
 *
 * 使用计算机隐喻替代表情符号：
 * - CPU = 思考速度
 * - 电池 = 精力
 * - 传感器 = 感官负荷
 * - 带宽 = 认知容量
 * - 温度 = 压力
 */
export function SystemIndicator({
  type,
  value,
  max = 5,
  label,
  unit,
  size = 'md',
}: SystemIndicatorProps) {
  const config = typeConfig[type];
  const percentage = Math.min((value / max) * 100, 100);
  const isSmall = size === 'sm';

  return (
    <div className={cn('flex items-center gap-2', isSmall ? 'text-xs' : 'text-sm')}>
      {/* 类型标签 */}
      <span
        className={cn(
          'font-mono font-medium tabular-nums leading-none',
          config.textColor,
          isSmall ? 'w-7 text-[10px]' : 'w-8 text-[11px]'
        )}
      >
        {config.label}
      </span>

      {/* 进度条 */}
      <div
        className={cn(
          'flex-1 overflow-hidden rounded-full bg-panel-hover',
          isSmall ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', config.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 数值 */}
      <span className="min-w-[3ch] text-right font-mono text-slate-400 tabular-nums">
        {value}
        {unit && <span className="text-[10px] text-slate-500">{unit}</span>}
      </span>

      {/* 标签 */}
      <span className="min-w-0 truncate text-slate-500">{label}</span>
    </div>
  );
}

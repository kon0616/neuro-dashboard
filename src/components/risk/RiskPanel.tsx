import { AlertTriangle, Info, Zap, Moon } from 'lucide-react';
import type { RiskResult } from '../../types';
import { cn } from '../../lib/utils';

interface RiskPanelProps {
  risks: RiskResult[];
}

const levelStyles = {
  none: {
    bg: 'bg-green-500/10 border-green-500/20',
    text: 'text-green-400',
    icon: Info,
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-400',
    icon: Info,
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    text: 'text-yellow-400',
    icon: AlertTriangle,
  },
  caution: {
    bg: 'bg-red-500/10 border-red-500/20',
    text: 'text-red-400',
    icon: AlertTriangle,
  },
};

const typeIcons = {
  activation: Zap,
  shutdown: Moon,
};

/**
 * 风险检测面板
 * 显示状态偏差警告，使用温和、非诊断性语言
 */
export function RiskPanel({ risks }: RiskPanelProps) {
  return (
    <div className="space-y-2">
      {risks.map((risk, index) => {
        const style = levelStyles[risk.level];
        const Icon = style.icon;
        const TypeIcon = risk.type ? typeIcons[risk.type] : null;

        return (
          <div
            key={index}
            className={cn(
              'rounded-lg border px-4 py-3',
              style.bg
            )}
          >
            {/* 头部 */}
            <div className="mb-2 flex items-center gap-2">
              {TypeIcon && (
                <TypeIcon className={cn('h-4 w-4', style.text)} />
              )}
              <Icon className={cn('h-4 w-4', style.text)} />
              <span className={cn('text-xs font-medium', style.text)}>
                {risk.level === 'caution'
                  ? '注意'
                  : risk.level === 'warning'
                  ? '提醒'
                  : '提示'}
              </span>

              {/* 等级点 */}
              <div className="ml-auto flex items-center gap-1">
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    risk.level === 'caution' || risk.level === 'warning'
                      ? 'bg-yellow-400'
                      : 'bg-blue-400'
                  )}
                />
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    risk.level === 'caution' ? 'bg-red-400' : 'bg-slate-700'
                  )}
                />
              </div>
            </div>

            {/* 消息 */}
            <p className="text-sm leading-relaxed text-slate-300">
              {risk.message}
            </p>

            {/* 触发指标列表 */}
            {risk.indicators.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {risk.indicators.map((indicator, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

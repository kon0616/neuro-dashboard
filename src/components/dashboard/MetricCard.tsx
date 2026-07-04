import React from 'react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  /** 卡片标题 */
  title: string;
  /** 标题旁的图标 */
  icon?: React.ReactNode;
  /** 子标题 / 描述 */
  subtitle?: string;
  /** 卡片内容 */
  children: React.ReactNode;
  /** 额外类名 */
  className?: string;
}

/**
 * 通用仪表盘卡片容器
 * 深色面板风格，大圆角，均匀间距
 */
export function MetricCard({
  title,
  icon,
  subtitle,
  children,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-panel-border bg-panel-card p-4',
        'transition-colors duration-150',
        className
      )}
    >
      {/* 卡片头部 */}
      <div className="mb-3 flex items-center gap-2">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-panel-hover text-slate-300">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-sm font-medium text-slate-200">{title}</h3>
          {subtitle && (
            <p className="text-[11px] leading-tight text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

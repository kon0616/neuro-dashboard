import { LayoutDashboard, Clock, TrendingUp, Brain, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

type Tab = 'dashboard' | 'timeline' | 'trends' | 'ai' | 'settings';

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'timeline', label: '时间线', icon: Clock },
  { id: 'trends', label: '趋势', icon: TrendingUp },
  { id: 'ai', label: 'AI', icon: Brain },
  { id: 'settings', label: '设置', icon: Settings },
];

/**
 * v2 底部 Tab 导航 — 5 个 tab
 */
export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="sticky bottom-0 z-10 border-t border-panel-border bg-panel-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-touch min-w-[60px]',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-blue-400',
                isActive
                  ? 'text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { Activity, Cpu } from 'lucide-react';

interface HeaderProps {
  sessionCount?: number;
}

/**
 * v2 顶部导航栏 — 显示今日会话数
 */
export function Header({ sessionCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-panel-border bg-panel-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <Cpu className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-200">
              Neuro Dashboard
            </h1>
            <p className="text-[10px] leading-none text-slate-500 font-mono">
              SYS STATUS: ONLINE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
          {sessionCount !== undefined && sessionCount > 0 && (
            <>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400">
                {sessionCount} 次签到
              </span>
              <div className="h-3 w-px bg-panel-border" />
            </>
          )}
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-green-400" />
            <span>LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { TimelineView } from './components/timeline/TimelineView';
import { TrendView } from './components/trends/TrendView';
import { AIPanel } from './components/ai/AIPanel';
import { SettingsView } from './components/settings/SettingsView';
import { needsMigration, migrateV1ToV2 } from './lib/migration';
import { getDay } from './lib/storage';
import { getToday } from './lib/utils';

type Tab = 'dashboard' | 'timeline' | 'trends' | 'ai' | 'settings';

/**
 * Neuro Dashboard v2 根组件
 *
 * 启动时运行 v1 → v2 数据迁移
 * 5 个 Tab：仪表盘 | 时间线 | 趋势 | AI | 设置
 */
function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [migrated, setMigrated] = useState(false);

  // 启动时迁移
  useEffect(() => {
    if (needsMigration()) {
      migrateV1ToV2();
    }
    setMigrated(true);
  }, []);

  // 今日会话数（用于 Header）
  const today = getToday();
  const day = getDay(today);
  const sessionCount = day?.sessions.length ?? 0;

  if (!migrated) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-panel-bg">
        <p className="font-mono text-sm text-slate-500">初始化中…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-panel-bg">
      <Header sessionCount={sessionCount} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-4">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'trends' && <TrendView />}
        {activeTab === 'ai' && <AIPanel />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;

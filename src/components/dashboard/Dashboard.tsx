import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDay } from '../../hooks/useDay';
import { useCurrentSession } from '../../hooks/useSessions';
import { useBehaviors } from '../../hooks/useBehaviors';
import { useEventTypes, useDayEvents } from '../../hooks/useEvents';
import { useRiskDetection } from '../../hooks/useRiskDetection';
import { getSleep, setSleep } from '../../lib/storage';
import { SessionInput } from './SessionInput';
import { DailyDifference } from './DailyDifference';
import { DailySleep } from './DailySleep';
import { TodaySummary } from './TodaySummary';
import { RiskPanel } from '../risk/RiskPanel';
import { getToday } from '../../lib/utils';

/**
 * v2 仪表盘 — 多时段签到 + 独立睡眠卡片
 */
export function Dashboard() {
  const today = getToday();
  const { day, isLoaded, addSession, deleteSession, setDifference, refresh } = useDay(today);
  const { session, updateBrain, updateBody, updateSensory, updateEnvironment, toggleBehavior, setNote, setPeriod, save } =
    useCurrentSession(today);
  const { behaviors } = useBehaviors();
  const { eventTypes } = useEventTypes();
  const { logEvent } = useDayEvents(today);

  const { risks } = useRiskDetection(day.sessions);

  const [showForm, setShowForm] = useState(false);

  // 睡眠状态（日级别）
  const [sleep, setSleepState] = useState(() => getSleep(today));

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-sm text-slate-500">加载中...</p>
      </div>
    );
  }

  const handleSave = () => {
    const saved = save();
    addSession(saved);
    setShowForm(false);
  };

  const handleSleepHours = (hours: number) => {
    setSleep(today, hours, sleep.quality);
    setSleepState({ ...sleep, hours });
    refresh();
  };

  const handleSleepQuality = (quality: number) => {
    setSleep(today, sleep.hours, quality);
    setSleepState({ ...sleep, quality });
    refresh();
  };

  const handleLogEvent = (eventTypeId: string) => {
    logEvent(eventTypeId);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* 风险检测 */}
      {risks.length > 0 && <RiskPanel risks={risks} />}
      {risks.length === 0 && day.sessions.length > 0 && (
        <div className="rounded-lg border border-panel-border bg-panel-card/50 px-4 py-3">
          <p className="font-mono text-[11px] text-slate-500">
            <span className="text-green-400">●</span> 系统状态：未检测到显著偏差
          </p>
        </div>
      )}

      {/* 睡眠卡片 — 每天一次 */}
      <DailySleep
        hours={sleep.hours}
        quality={sleep.quality}
        onHoursChange={handleSleepHours}
        onQualityChange={handleSleepQuality}
      />

      {/* 每日一句 */}
      <DailyDifference value={day.dailyDifference} onChange={setDifference} />

      {/* 今日会话列表 */}
      <TodaySummary sessions={day.sessions} onDelete={deleteSession} />

      {/* 新增签到按钮 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-panel-border bg-panel-card/30 py-4 text-sm text-slate-500 hover:border-blue-500/30 hover:text-blue-400 transition-colors min-h-touch"
        >
          <Plus className="h-4 w-4" />
          新增签到
        </button>
      )}

      {/* 签到表单 */}
      {showForm && (
        <>
          <SessionInput
            session={session}
            behaviors={behaviors}
            eventTypes={eventTypes}
            onUpdateBrain={updateBrain}
            onUpdateBody={updateBody}
            onUpdateSensory={updateSensory}
            onUpdateEnvironment={updateEnvironment}
            onToggleBehavior={toggleBehavior}
            onSetNote={setNote}
            onSetPeriod={setPeriod}
            onLogEvent={handleLogEvent}
            onSave={handleSave}
          />
          <button
            onClick={() => setShowForm(false)}
            className="w-full rounded-lg py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            取消
          </button>
        </>
      )}

      {/* 空状态 */}
      {day.sessions.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-mono text-sm text-slate-500">还没有今天的记录</p>
          <p className="mt-1 text-xs text-slate-600">
            点击上方按钮开始第一次签到
          </p>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Plus, Calendar, History } from 'lucide-react';
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
import { getToday, formatDateFull } from '../../lib/utils';

/**
 * v2 仪表盘 — 支持选择任意日期补充记录
 */
export function Dashboard() {
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;

  const { day, isLoaded, addSession, deleteSession, setDifference } = useDay(selectedDate);
  const { session, updateBrain, updateBody, updateSensory, updateEnvironment, toggleBehavior, setNote, setPeriod, save } =
    useCurrentSession(selectedDate);
  const { behaviors } = useBehaviors();
  const { eventTypes } = useEventTypes();
  const { logEvent } = useDayEvents(selectedDate);

  const { risks } = useRiskDetection(day.sessions);

  const [showForm, setShowForm] = useState(false);

  // 睡眠状态
  const [sleep, setSleepState] = useState(() => getSleep(selectedDate));

  // 日期变更时刷新睡眠
  const handleDateChange = (d: string) => {
    setSelectedDate(d);
    setShowForm(false);
    setSleepState(getSleep(d));
  };

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
    setSleep(selectedDate, hours, sleep.quality);
    setSleepState({ ...sleep, hours });
  };

  const handleSleepQuality = (quality: number) => {
    setSleep(selectedDate, sleep.hours, quality);
    setSleepState({ ...sleep, quality });
  };

  const handleLogEvent = (eventTypeId: string) => {
    logEvent(eventTypeId);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* 日期选择器 */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => handleDateChange(e.target.value)}
          className="flex-1 rounded-lg border border-panel-border bg-panel-hover px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
        />
        <button
          onClick={() => handleDateChange(today)}
          className={`shrink-0 rounded-lg px-3 py-2 text-xs transition-colors min-h-touch ${
            isToday
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-panel-hover text-slate-500 hover:text-slate-300'
          }`}
        >
          今天
        </button>
      </div>

      {!isToday && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-2">
          <History className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400">
            正在补充 <span className="font-medium">{formatDateFull(selectedDate)}</span> 的记录
          </p>
        </div>
      )}

      {/* 风险检测 */}
      {risks.length > 0 && <RiskPanel risks={risks} />}
      {risks.length === 0 && day.sessions.length > 0 && (
        <div className="rounded-lg border border-panel-border bg-panel-card/50 px-4 py-3">
          <p className="font-mono text-[11px] text-slate-500">
            <span className="text-green-400">●</span> 系统状态：未检测到显著偏差
          </p>
        </div>
      )}

      {/* 睡眠卡片 */}
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
          <p className="font-mono text-sm text-slate-500">当天还没有记录</p>
          <p className="mt-1 text-xs text-slate-600">
            点击上方按钮{isToday ? '开始第一次签到' : '补充当天记录'}
          </p>
        </div>
      )}
    </div>
  );
}

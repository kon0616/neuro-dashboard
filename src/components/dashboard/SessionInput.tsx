import { Cpu, Battery, Radio, Thermometer, ListChecks, Save, Plus } from 'lucide-react';
import type { Session, SessionBrain, SessionBody, SessionSensory, SessionEnvironment, DayPeriod } from '../../types/session';
import { periodLabels } from '../../types/session';
import type { BehaviorDefinition } from '../../types/behavior';
import type { EventTypeDefinition } from '../../types/event';
import { SystemIndicator } from './SystemIndicator';

interface SessionInputProps {
  session: Session;
  behaviors: BehaviorDefinition[];
  eventTypes: EventTypeDefinition[];
  onUpdateBrain: (b: Partial<SessionBrain>) => void;
  onUpdateBody: (b: Partial<SessionBody>) => void;
  onUpdateSensory: (s: Partial<SessionSensory>) => void;
  onUpdateEnvironment: (e: Partial<SessionEnvironment>) => void;
  onToggleBehavior: (id: string, checked: boolean) => void;
  onSetNote: (note: string) => void;
  onSetPeriod: (p: DayPeriod) => void;
  onLogEvent: (eventTypeId: string) => void;
  onSave: () => void;
}

/**
 * 统一的会话签到表单
 * 替代 v1 的 5 个独立卡片
 */
export function SessionInput({
  session,
  behaviors,
  eventTypes,
  onUpdateBrain,
  onUpdateBody,
  onUpdateSensory,
  onUpdateEnvironment,
  onToggleBehavior,
  onSetNote,
  onSetPeriod,
  onLogEvent,
  onSave,
}: SessionInputProps) {
  const totalSensory =
    session.sensory.soundOverload +
    session.sensory.lightOverload +
    session.sensory.socialOverload +
    session.sensory.infoOverload;

  const checkedCount = Object.values(session.behavior).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* 时段选择 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">时段</span>
        <div className="flex gap-1.5">
          {(Object.entries(periodLabels) as [DayPeriod, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onSetPeriod(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors min-h-touch
                ${
                  session.period === key
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-panel-hover text-slate-400 border border-transparent hover:text-slate-300'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 系统指示器概览 */}
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-panel-border bg-panel-hover/30 p-3">
        <SystemIndicator type="cpu" value={session.brain.thinkingSpeed} max={5} label="CPU" size="sm" />
        <SystemIndicator type="battery" value={session.body.energy} max={5} label="电量" size="sm" />
        <SystemIndicator type="sensor" value={totalSensory} max={20} label="感官" size="sm" />
        <SystemIndicator type="temp" value={session.body.physicalTension} max={5} label="紧张" size="sm" />
      </div>

      {/* 大脑 */}
      <Section title="大脑" subtitle="认知状态" icon={<Cpu className="h-4 w-4" />}>
        <SliderRow label="思考速度" value={session.brain.thinkingSpeed} max={5} unit="/5"
          onChange={(v) => onUpdateBrain({ thinkingSpeed: v })} labels={['很慢', '飞速']} />
        <ChipGroup
          label="新想法"
          options={[
            { value: '0', label: '无' },
            { value: '1-3', label: '1~3' },
            { value: '4-10', label: '4~10' },
            { value: '10+', label: '10+' },
          ]}
          selected={session.brain.newIdeas}
          onSelect={(v) => onUpdateBrain({ newIdeas: v as SessionBrain['newIdeas'] })}
        />
        <SliderRow label="活跃项目" value={session.brain.activeProjects} max={10}
          onChange={(v) => onUpdateBrain({ activeProjects: v })} />
        <ChipGroup
          label="能停止思考？"
          options={[
            { value: 'yes', label: '可以' },
            { value: 'difficult', label: '困难' },
            { value: 'no', label: '不能' },
          ]}
          selected={session.brain.canStopThinking}
          onSelect={(v) => onUpdateBrain({ canStopThinking: v as SessionBrain['canStopThinking'] })}
        />
      </Section>

      {/* 身体 */}
      <Section title="身体" subtitle="生理状态" icon={<Battery className="h-4 w-4" />}>
        <SliderRow label="精力" value={session.body.energy} max={5} unit="/5"
          onChange={(v) => onUpdateBody({ energy: v })} />
        <SliderRow label="食欲" value={session.body.appetite} max={5} unit="/5"
          onChange={(v) => onUpdateBody({ appetite: v })} />
        <SliderRow label="身体紧张度" value={session.body.physicalTension} max={5} unit="/5"
          onChange={(v) => onUpdateBody({ physicalTension: v })} />
      </Section>

      {/* 感官 */}
      <Section title="感官" subtitle="刺激处理" icon={<Radio className="h-4 w-4" />}>
        <SliderRow label="声音过载" value={session.sensory.soundOverload} max={5} unit="/5"
          onChange={(v) => onUpdateSensory({ soundOverload: v })} labels={['正常', '过载']} />
        <SliderRow label="光线过载" value={session.sensory.lightOverload} max={5} unit="/5"
          onChange={(v) => onUpdateSensory({ lightOverload: v })} labels={['正常', '过载']} />
        <SliderRow label="社交过载" value={session.sensory.socialOverload} max={5} unit="/5"
          onChange={(v) => onUpdateSensory({ socialOverload: v })} labels={['正常', '过载']} />
        <SliderRow label="信息过载" value={session.sensory.infoOverload} max={5} unit="/5"
          onChange={(v) => onUpdateSensory({ infoOverload: v })} labels={['正常', '过载']} />
      </Section>

      {/* 环境 */}
      <Section title="环境" subtitle="外部因素" icon={<Thermometer className="h-4 w-4" />}>
        <SliderRow label="屏幕时间" value={session.environment.screenTime} max={18} step={0.5} unit="h"
          onChange={(v) => onUpdateEnvironment({ screenTime: v })} />
        <SliderRow label="咖啡因" value={session.environment.caffeine} max={10} unit="杯"
          onChange={(v) => onUpdateEnvironment({ caffeine: v })} />
        <SliderRow label="运动" value={session.environment.exercise} max={180} step={5} unit="min"
          onChange={(v) => onUpdateEnvironment({ exercise: v })} />
        <SliderRow label="户外时间" value={session.environment.timeOutside} max={480} step={5} unit="min"
          onChange={(v) => onUpdateEnvironment({ timeOutside: v })} />
      </Section>

      {/* 行为 */}
      <Section
        title="行为标记"
        subtitle={`${checkedCount} 项`}
        icon={<ListChecks className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {behaviors.map((b) => (
            <label
              key={b.id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors min-h-touch
                ${
                  session.behavior[b.id]
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : 'bg-panel-hover/50 border border-transparent hover:bg-panel-hover'
                }`}
            >
              <input
                type="checkbox"
                className="toggle-check"
                checked={!!session.behavior[b.id]}
                onChange={(e) => onToggleBehavior(b.id, e.target.checked)}
              />
              <span className={`text-xs ${session.behavior[b.id] ? 'text-blue-300' : 'text-slate-400'}`}>
                {b.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* 快速记录事件 */}
      <Section title="事件" subtitle="今天发生了什么？" icon={<Plus className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-1.5">
          {eventTypes.map((et) => (
            <button
              key={et.id}
              onClick={() => onLogEvent(et.id)}
              className="rounded-full border border-panel-border bg-panel-hover px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-panel-card hover:text-slate-200 min-h-touch"
            >
              {et.label}
            </button>
          ))}
        </div>
      </Section>

      {/* 备注 */}
      <Section title="备注" subtitle="可选">
        <textarea
          value={session.note ?? ''}
          onChange={(e) => onSetNote(e.target.value)}
          placeholder="任何想记录的内容…"
          rows={2}
          className="w-full resize-none rounded-lg border border-panel-border bg-panel-hover px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
        />
      </Section>

      {/* 保存按钮 */}
      <button
        onClick={onSave}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 py-3 font-medium text-sm hover:bg-blue-500/30 transition-colors min-h-touch"
      >
        <Save className="h-4 w-4" />
        保存签到
      </button>
    </div>
  );
}

/** 区块容器 */
function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel-card p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-panel-hover text-slate-300">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-sm font-medium text-slate-200">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** 滑块行 */
function SliderRow({
  label,
  value,
  max = 5,
  step = 1,
  unit = '',
  onChange,
  labels,
}: {
  label: string;
  value: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  labels?: [string, string];
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="font-mono text-xs text-slate-500">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label={label}
      />
      {labels && (
        <div className="mt-0.5 flex justify-between text-[10px] text-slate-600">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}

/** 芯片选择组 */
function ChipGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-xs text-slate-400">{label}</span>
      <div className="mt-1.5 flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors min-h-touch
              ${
                selected === opt.value
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-panel-hover text-slate-400 border border-transparent hover:text-slate-300'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

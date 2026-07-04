import { useState } from 'react';
import { useHistory } from '../../hooks/useHistory';
import type { DailyRecord } from '../../types';
import { formatDateFull } from '../../lib/utils';
import { deleteRecord } from '../../lib/storage';
import {
  Cpu,
  Battery,
  Radio,
  Thermometer,
  ListChecks,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';

/**
 * 历史记录列表
 * 按日期倒序展示，可展开查看详情
 */
export function HistoryList() {
  const { records, isLoaded, refresh } = useHistory();
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-sm text-slate-500">加载中...</p>
      </div>
    );
  }

  // 按日期倒序
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="font-mono text-sm text-slate-500">暂无记录</p>
        <p className="mt-1 text-xs text-slate-600">
          返回仪表盘开始记录今天的神经状态
        </p>
      </div>
    );
  }

  const handleDelete = (date: string) => {
    deleteRecord(date);
    refresh();
    if (expandedDate === date) setExpandedDate(null);
  };

  return (
    <div className="space-y-2 pb-4">
      <h2 className="text-sm font-medium text-slate-300">历史记录</h2>

      {sorted.map((record) => (
        <HistoryCard
          key={record.date}
          record={record}
          isExpanded={expandedDate === record.date}
          onToggle={() =>
            setExpandedDate(
              expandedDate === record.date ? null : record.date
            )
          }
          onDelete={() => handleDelete(record.date)}
        />
      ))}
    </div>
  );
}

/** 单条历史记录摘要卡片 */
function HistoryCard({
  record,
  isExpanded,
  onToggle,
  onDelete,
}: {
  record: DailyRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const totalBehavior = Object.values(record.behavior).filter(Boolean).length;
  const totalSensory =
    record.sensory.soundOverload +
    record.sensory.lightOverload +
    record.sensory.socialOverload +
    record.sensory.infoOverload;

  return (
    <div className="rounded-xl border border-panel-border bg-panel-card overflow-hidden">
      {/* 摘要行 */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-panel-hover/50"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-200">
            {formatDateFull(record.date)}
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-0.5">
              <Cpu className="h-3 w-3" />
              {record.brain.thinkingSpeed}
            </span>
            <span className="flex items-center gap-0.5">
              <Battery className="h-3 w-3" />
              {record.body.energy}
            </span>
            <span className="flex items-center gap-0.5">
              <Radio className="h-3 w-3" />
              {totalSensory}
            </span>
            <span className="flex items-center gap-0.5">
              <Thermometer className="h-3 w-3" />
              {record.environment.stress}
            </span>
            <span className="flex items-center gap-0.5">
              <ListChecks className="h-3 w-3" />
              {totalBehavior}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="删除此记录"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* 展开详情 */}
      {isExpanded && (
        <div className="border-t border-panel-border px-4 py-3 space-y-2">
          <DetailSection title="大脑" icon={<Cpu className="h-3 w-3" />}>
            <DetailRow label="思考速度" value={`${record.brain.thinkingSpeed}/5`} />
            <DetailRow label="新想法" value={record.brain.newIdeas} />
            <DetailRow label="活跃项目" value={`${record.brain.activeProjects}`} />
            <DetailRow
              label="能停止思考"
              value={
                record.brain.canStopThinking === 'yes'
                  ? '可以'
                  : record.brain.canStopThinking === 'difficult'
                  ? '困难'
                  : '不能'
              }
            />
          </DetailSection>

          <DetailSection title="身体" icon={<Battery className="h-3 w-3" />}>
            <DetailRow label="睡眠" value={`${record.body.sleepHours}h`} />
            <DetailRow label="睡眠质量" value={`${record.body.sleepQuality}/5`} />
            <DetailRow label="精力" value={`${record.body.energy}/5`} />
            <DetailRow label="食欲" value={`${record.body.appetite}/5`} />
            <DetailRow label="身体紧张度" value={`${record.body.physicalTension}/5`} />
          </DetailSection>

          <DetailSection title="感官" icon={<Radio className="h-3 w-3" />}>
            <DetailRow label="声音" value={`${record.sensory.soundOverload}/5`} />
            <DetailRow label="光线" value={`${record.sensory.lightOverload}/5`} />
            <DetailRow label="社交" value={`${record.sensory.socialOverload}/5`} />
            <DetailRow label="信息" value={`${record.sensory.infoOverload}/5`} />
          </DetailSection>

          <DetailSection title="环境" icon={<Thermometer className="h-3 w-3" />}>
            <DetailRow label="压力" value={`${record.environment.stress}/5`} />
            <DetailRow label="屏幕时间" value={`${record.environment.screenTime}h`} />
            <DetailRow label="咖啡因" value={`${record.environment.caffeine}杯`} />
            <DetailRow label="运动" value={`${record.environment.exercise}min`} />
            <DetailRow label="户外时间" value={`${record.environment.timeOutside}min`} />
          </DetailSection>

          {totalBehavior > 0 && (
            <DetailSection title="行为标记" icon={<ListChecks className="h-3 w-3" />}>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(record.behavior)
                  .filter(([, v]) => v)
                  .map(([key]) => (
                    <span
                      key={key}
                      className="inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400"
                    >
                      {behaviorLabels[key as keyof typeof behaviorLabels]}
                    </span>
                  ))}
              </div>
            </DetailSection>
          )}
        </div>
      )}
    </div>
  );
}

/** 详情区块 */
function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-slate-500">{icon}</span>
        <span className="text-[11px] font-medium text-slate-400">{title}</span>
      </div>
      <div className="space-y-0.5 pl-4">{children}</div>
    </div>
  );
}

/** 详情行 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-300">{value}</span>
    </div>
  );
}

const behaviorLabels: Record<string, string> = {
  startedManyProjects: '启动多个新项目',
  talkedMuchMore: '话量显著增加',
  hyperfocused: '长时间高度专注',
  forgotMeals: '忘记吃饭',
  stayedUpLate: '熬夜',
  impulseSpending: '冲动消费',
  avoidedCommunication: '避免社交',
  stayedInBed: '大部分时间卧床',
  difficultyStartingTasks: '启动任务困难',
};

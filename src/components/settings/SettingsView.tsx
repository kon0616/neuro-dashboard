import { useState } from 'react';
import { ListChecks, Tag, Download, Upload, Trash2 } from 'lucide-react';
import { useBehaviors } from '../../hooks/useBehaviors';
import { useEventTypes } from '../../hooks/useEvents';
import { getAllDays, getAllSessions, getEventTypeDefinitions } from '../../lib/storage';
import type { BehaviorDefinition } from '../../types/behavior';
import type { EventTypeDefinition } from '../../types/event';

/**
 * 设置页面
 */
export function SettingsView() {
  const [activeTab, setActiveTab] = useState<'behaviors' | 'events' | 'data'>('behaviors');

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-sm font-medium text-slate-200">设置</h2>

      {/* 子 Tab */}
      <div className="flex gap-1.5 rounded-lg bg-panel-hover p-0.5">
        {([
          { id: 'behaviors', label: '行为', icon: ListChecks },
          { id: 'events', label: '事件', icon: Tag },
          { id: 'data', label: '数据', icon: Download },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'bg-panel-card text-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'behaviors' && <BehaviorManager />}
      {activeTab === 'events' && <EventTypeManager />}
      {activeTab === 'data' && <DataExport />}
    </div>
  );
}

/** 行为管理 */
function BehaviorManager() {
  const { behaviors, defaultBehaviors, customBehaviors, add, update, remove } = useBehaviors();
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    add({
      id: `custom-${crypto.randomUUID().slice(0, 8)}`,
      label: newLabel.trim(),
      category: 'neutral',
      isDefault: false,
    });
    setNewLabel('');
  };

  const handleEdit = (def: BehaviorDefinition) => {
    setEditingId(def.id);
    setEditLabel(def.label);
  };

  const handleSaveEdit = () => {
    if (!editLabel.trim() || !editingId) return;
    const def = behaviors.find((b) => b.id === editingId);
    if (def) {
      update({ ...def, label: editLabel.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      {/* 添加新行为 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="新行为名称…"
          className="flex-1 rounded-lg border border-panel-border bg-panel-hover px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-2 text-sm hover:bg-blue-500/30 transition-colors"
        >
          添加
        </button>
      </div>

      {/* 行为列表 */}
      <div className="space-y-1.5">
        {behaviors.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-2 rounded-lg bg-panel-hover/50 px-3 py-2"
          >
            {editingId === b.id ? (
              <>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="flex-1 rounded border border-panel-border bg-panel-card px-2 py-1 text-sm text-slate-300 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <button onClick={handleSaveEdit} className="text-xs text-blue-400">保存</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-slate-300">{b.label}</span>
                {b.isDefault && (
                  <span className="rounded bg-panel-border px-1.5 py-0.5 text-[10px] text-slate-500">默认</span>
                )}
                <span className={`rounded px-1.5 py-0.5 text-[10px] ${
                  b.category === 'activation' ? 'bg-amber-500/10 text-amber-400' :
                  b.category === 'shutdown' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  {b.category === 'activation' ? '激活' : b.category === 'shutdown' ? '关闭' : '中性'}
                </span>
                {!b.isDefault && (
                  <>
                    <button onClick={() => handleEdit(b)} className="text-xs text-slate-500 hover:text-slate-300">编辑</button>
                    <button onClick={() => remove(b.id)} className="text-xs text-red-500 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 事件类型管理 */
function EventTypeManager() {
  const { eventTypes, add, remove } = useEventTypes();
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    add({
      id: `custom-event-${crypto.randomUUID().slice(0, 8)}`,
      label: newLabel.trim(),
      icon: 'Circle',
      isDefault: false,
    });
    setNewLabel('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="新事件类型…"
          className="flex-1 rounded-lg border border-panel-border bg-panel-hover px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-2 text-sm hover:bg-blue-500/30 transition-colors"
        >
          添加
        </button>
      </div>

      <div className="space-y-1.5">
        {eventTypes.map((et) => (
          <div key={et.id} className="flex items-center gap-2 rounded-lg bg-panel-hover/50 px-3 py-2">
            <span className="flex-1 text-sm text-slate-300">{et.label}</span>
            {et.isDefault && (
              <span className="rounded bg-panel-border px-1.5 py-0.5 text-[10px] text-slate-500">默认</span>
            )}
            {!et.isDefault && (
              <button onClick={() => remove(et.id)} className="text-xs text-red-500 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 数据导出/导入 */
function DataExport() {
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const handleExport = () => {
    const days = getAllDays();
    const sessions = getAllSessions();
    const exportData = {
      exportDate: new Date().toISOString(),
      version: 2,
      days,
      sessionCount: sessions.length,
      dayCount: days.length,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuro-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // 验证最低限度的结构
        if (!data.days || !Array.isArray(data.days)) {
          setImportMsg('无效的备份文件：缺少 days 字段');
          return;
        }

        // 合并数据：按日期去重，新数据覆盖旧数据
        const existing = getAllDays();
        const existingMap = new Map(existing.map((d) => [d.date, d]));
        data.days.forEach((d: typeof existing[0]) => {
          existingMap.set(d.date, d);
        });
        const merged = [...existingMap.values()].sort((a, b) => a.date.localeCompare(b.date));
        localStorage.setItem('neuro-v2-days', JSON.stringify(merged));

        const sessionCount = merged.reduce((s, d) => s + d.sessions.length, 0);
        setImportMsg(`导入成功：${merged.length} 天，${sessionCount} 次签到`);
      } catch {
        setImportMsg('文件解析失败，请检查是否为有效的 JSON 备份文件');
      }
    };
    input.click();
  };

  const days = getAllDays();
  const sessions = getAllSessions();

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-panel-hover/50 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">记录天数</span>
          <span className="font-mono text-slate-300">{days.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">签到次数</span>
          <span className="font-mono text-slate-300">{sessions.length}</span>
        </div>
      </div>

      {importMsg && (
        <div className={`rounded-lg px-4 py-3 text-xs ${
          importMsg.startsWith('导入成功')
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {importMsg}
        </div>
      )}

      <button
        onClick={handleExport}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 py-3 font-medium text-sm hover:bg-blue-500/20 transition-colors min-h-touch"
      >
        <Download className="h-4 w-4" />
        导出全部数据 (JSON)
      </button>

      <button
        onClick={handleImport}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 py-3 font-medium text-sm hover:bg-green-500/20 transition-colors min-h-touch"
      >
        <Upload className="h-4 w-4" />
        导入备份数据
      </button>
    </div>
  );
}

import { useState } from 'react';
import { Eye, TrendingUp, Brain, Settings, Wifi, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useDay } from '../../hooks/useDay';
import { getToday } from '../../lib/utils';
import { Observer } from './Observer';
import { PatternFinder } from './PatternFinder';
import { InsightEngine } from './InsightEngine';
import { useConfig } from '../../hooks/useConfig';
import { normalizeUrl } from '../../lib/utils';

type AITab = 'observer' | 'patterns' | 'insight';

const tabs: { id: AITab; label: string; desc: string; icon: typeof Eye }[] = [
  { id: 'observer', label: '观察者', desc: '今日事实摘要', icon: Eye },
  { id: 'patterns', label: '模式发现', desc: '多时间尺度', icon: TrendingUp },
  { id: 'insight', label: '深度觉察', desc: '个人认知模型', icon: Brain },
];

/** 常见 AI 提供商预设 */
const PROVIDERS: { name: string; endpoint: string; models: string[] }[] = [
  {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    name: '智谱 GLM',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: ['glm-4-plus', 'glm-4-flash'],
  },
  {
    name: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  },
  {
    name: 'Moonshot',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  },
  {
    name: '自定义',
    endpoint: '',
    models: [],
  },
];

/**
 * AI 面板 — 三层架构容器 + 提供商配置
 */
export function AIPanel() {
  const [activeTab, setActiveTab] = useState<AITab>('observer');
  const [showConfig, setShowConfig] = useState(false);
  const today = getToday();
  const { day } = useDay(today);

  return (
    <div className="space-y-4 pb-4">
      {/* 子 tab 切换 */}
      <div className="flex gap-1 rounded-lg bg-panel-hover p-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors
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

      {/* API 配置按钮 */}
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-panel-border py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <Settings className="h-3 w-3" />
        {showConfig ? '隐藏配置' : 'API 配置'}
      </button>

      {showConfig && <AIConfigPanel />}

      {/* 面板内容 */}
      {activeTab === 'observer' && <Observer day={day} />}
      {activeTab === 'patterns' && <PatternFinder />}
      {activeTab === 'insight' && <InsightEngine />}
    </div>
  );
}

/** AI 配置面板 */
function AIConfigPanel() {
  const { config, updateConfig } = useConfig();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [testError, setTestError] = useState('');

  const handleProvider = (name: string) => {
    const provider = PROVIDERS.find((p) => p.name === name);
    if (provider && provider.endpoint) {
      updateConfig({
        apiEndpoint: provider.endpoint,
        model: provider.models[0] ?? config.model,
      });
    }
  };

  const handleTest = async () => {
    if (!config.apiKey || !config.apiEndpoint) {
      setTestError('请先填写 API Key 和端点');
      setTestStatus('fail');
      return;
    }

    setTestStatus('testing');
    setTestError('');

    const apiUrl = normalizeUrl(config.apiEndpoint);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        setTestStatus('ok');
      } else {
        const body = await response.text().catch(() => '');
        setTestError(`${response.status} ${response.statusText}\n请求: ${apiUrl}\n${body.slice(0, 200)}`);
        setTestStatus('fail');
      }
    } catch (e) {
      setTestError(`网络错误\n请求: ${apiUrl}\n${e instanceof Error ? e.message : String(e)}`);
      setTestStatus('fail');
    }
  };

  return (
    <div className="rounded-xl border border-panel-border bg-panel-card p-4 space-y-3">
      {/* 提供商选择 */}
      <div>
        <label className="text-xs text-slate-400">AI 提供商</label>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleProvider(p.name)}
              className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                config.apiEndpoint === p.endpoint
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-panel-hover text-slate-400 border border-transparent hover:text-slate-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 端点 */}
      <div>
        <label className="text-xs text-slate-400">API 端点</label>
        <input
          type="text"
          value={config.apiEndpoint}
          onChange={(e) => updateConfig({ apiEndpoint: e.target.value })}
          placeholder="https://api.openai.com/v1/chat/completions"
          className="mt-1 w-full rounded-lg border border-panel-border bg-panel-hover px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* API Key */}
      <div>
        <label className="text-xs text-slate-400">API Key</label>
        <input
          type="password"
          value={config.apiKey}
          onChange={(e) => updateConfig({ apiKey: e.target.value })}
          placeholder="sk-..."
          className="mt-1 w-full rounded-lg border border-panel-border bg-panel-hover px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* 模型 */}
      <div>
        <label className="text-xs text-slate-400">模型</label>
        <input
          type="text"
          value={config.model}
          onChange={(e) => updateConfig({ model: e.target.value })}
          placeholder="gpt-4o-mini"
          className="mt-1 w-full rounded-lg border border-panel-border bg-panel-hover px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* 启用 + 测试 */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="toggle-check"
            checked={config.enabled}
            onChange={(e) => updateConfig({ enabled: e.target.checked })}
          />
          <span className="text-xs text-slate-400">启用</span>
        </label>

        <button
          onClick={handleTest}
          disabled={testStatus === 'testing'}
          className="flex items-center gap-1.5 rounded-lg border border-panel-border px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          {testStatus === 'testing' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : testStatus === 'ok' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          ) : testStatus === 'fail' ? (
            <XCircle className="h-3.5 w-3.5 text-red-400" />
          ) : (
            <Wifi className="h-3.5 w-3.5" />
          )}
          测试连接
        </button>
      </div>

      {/* 测试结果 */}
      {testError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-xs text-red-400 whitespace-pre-wrap break-all">{testError}</p>
        </div>
      )}
      {testStatus === 'ok' && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <p className="text-xs text-green-400">连接成功</p>
        </div>
      )}
    </div>
  );
}

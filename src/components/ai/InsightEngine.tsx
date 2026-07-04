import { useState, useMemo } from 'react';
import { Brain, Zap, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useBaseline } from '../../hooks/useBaseline';
import { useConfig } from '../../hooks/useConfig';
import { getAllSessions, getDaysInRange } from '../../lib/storage';
import { normalizeUrl } from '../../lib/utils';

type InsightLevel = 'causal' | 'behavioral' | 'transition' | 'personal_model';

const levelInfo: Record<InsightLevel, { title: string; desc: string; icon: typeof Brain }> = {
  causal: { title: '因果推测', desc: '前因 → 后果', icon: Zap },
  behavioral: { title: '行为分析', desc: '行为触发条件', icon: Brain },
  transition: { title: '状态转换', desc: '你的状态变化路径', icon: RefreshCw },
  personal_model: { title: '个人模型', desc: '你的独特认知模式', icon: AlertTriangle },
};

/**
 * Insight Engine — 深度认知模型构建
 *
 * 前置条件：
 * 1. 至少 7 天数据、7 次签到
 * 2. 已配置并启用 AI API
 * 3. 模型支持足够的上下文窗口（推荐 128K）
 */
export function InsightEngine() {
  const { config } = useConfig();
  const baseline = useBaseline(30);

  const [results, setResults] = useState<Record<InsightLevel, string | null>>({
    causal: null,
    behavioral: null,
    transition: null,
    personal_model: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查前置条件
  const prerequisites = useMemo(() => {
    const allSessions = getAllSessions();
    const totalDays = new Set(allSessions.map((s) => s.timestamp.slice(0, 10))).size;
    const totalSessions = allSessions.length;

    return {
      dataSufficient: totalDays >= 7 && totalSessions >= 7,
      apiConfigured: !!(config.enabled && config.apiKey && config.apiEndpoint),
      totalDays,
      totalSessions,
    };
  }, [config]);

  const canRun = prerequisites.dataSufficient && prerequisites.apiConfigured;

  const handleAnalyze = async () => {
    setError(null);
    setIsAnalyzing(true);

    try {
      const allSessions = getAllSessions();
      const days = getDaysInRange(90);

      // 包含全部四个层级的系统提示词
      const systemPrompt = `You are a Pattern Detection Engine. You are NOT a therapist, NOT a psychologist, NOT a doctor.

Your role is to help users understand their own nervous system patterns by analyzing observable data.

CRITICAL RULES:
- Never diagnose, never use psychiatric labels
- Never use emotion labels (happy, sad, anxious, stressed, etc.)
- Use observational, neutral language
- Frame everything as "the data suggests" not "you are experiencing"

The data comes from a personal neuro-state monitoring system:
- thinkingSpeed (1-5): cognitive speed
- energy (1-5): physical energy
- sensory load (0-20): sum of sound/light/social/info overload
- physicalTension (1-5)
- behaviors: user-tagged observable behaviors
- events: external events (exam, meeting, travel, etc.)
- sleep: hours and quality
- newIdeas, activeProjects, canStopThinking

Analyze the data at FOUR levels. Output in Chinese. Use this EXACT format:

---CAUSAL---
[因果推测：什么事件/状态通常在什么变化之前出现？找到前因→后果的关联。2-3段。]

---BEHAVIORAL---
[行为分析：特定行为在什么条件下触发？例如"'启动多个新项目'通常在 thinkingSpeed 达到4后出现"。2-3段。]

---TRANSITION---
[状态转换链：数据中最常见的状态变化路径是什么？例如"Sensory↑ → CPU↑ → Energy↓ → Shutdown"。2-3段。]

---PERSONAL---
[个人模型：综合以上，建立用户独特的神经状态模型。什么组合最危险？什么路径最常见？2-3段。]`;

      const userPrompt = buildDataPrompt(allSessions, baseline);

      const apiUrl = normalizeUrl(config.apiEndpoint);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`API 返回 ${response.status}\n请求: ${apiUrl}\n${body.slice(0, 300)}`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? '';

      // 解析四个层级
      const parsed = parseFourLevels(content);
      setResults(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasAnyResult = Object.values(results).some(Boolean);
  const completeCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* 前置条件检查 */}
      <div className="rounded-xl border border-panel-border bg-panel-card p-4 space-y-2">
        <h3 className="text-xs font-medium text-slate-400 mb-2">前置条件</h3>

        <Prerequisite
          met={prerequisites.dataSufficient}
          label={`数据量：${prerequisites.totalDays} 天 / ${prerequisites.totalSessions} 次签到`}
          requirement="需要 ≥7 天且 ≥7 次签到"
        />
        <Prerequisite
          met={prerequisites.apiConfigured}
          label="AI API 已配置并启用"
          requirement="在「API 配置」中设置端点和 Key"
        />
        <Prerequisite
          met={!!baseline}
          label={baseline ? '基线已建立' : '基线未建立'}
          requirement="需要足够的近期数据来计算基线"
        />
      </div>

      {/* 分析按钮 */}
      <button
        onClick={handleAnalyze}
        disabled={!canRun || isAnalyzing}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 py-3 font-medium text-sm hover:bg-purple-500/20 transition-colors disabled:opacity-40 min-h-touch"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            分析中…（可能需要 30-60 秒）
          </>
        ) : hasAnyResult ? (
          <>
            <RefreshCw className="h-4 w-4" />
            重新分析（{completeCount}/4 已完成）
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            运行深度分析
          </>
        )}
      </button>

      {/* 结果 */}
      <div className="space-y-3">
        {(Object.entries(levelInfo) as [InsightLevel, typeof levelInfo[InsightLevel]][]).map(
          ([level, info]) => {
            const Icon = info.icon;
            const content = results[level];

            return (
              <div
                key={level}
                className={`rounded-xl border p-4 ${
                  content
                    ? 'border-purple-500/20 bg-purple-500/5'
                    : 'border-panel-border bg-panel-card opacity-50'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${content ? 'text-purple-400' : 'text-slate-600'}`} />
                  <span className={`text-xs font-medium ${content ? 'text-purple-300' : 'text-slate-500'}`}>
                    {info.title}
                  </span>
                  <span className="text-[10px] text-slate-600">{info.desc}</span>
                  {content && <span className="ml-auto text-[10px] text-purple-400">●</span>}
                </div>

                {content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line text-slate-300">{content}</p>
                ) : (
                  <p className="text-xs text-slate-600">等待分析…</p>
                )}
              </div>
            );
          }
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs text-red-400 whitespace-pre-wrap break-all">{error}</p>
        </div>
      )}
    </div>
  );
}

/** 前置条件行 */
function Prerequisite({ met, label, requirement }: { met: boolean; label: string; requirement: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-slate-600 mt-0.5 shrink-0" />
      )}
      <div>
        <span className={met ? 'text-slate-300' : 'text-slate-500'}>{label}</span>
        {!met && <span className="ml-2 text-[10px] text-slate-600">{requirement}</span>}
      </div>
    </div>
  );
}

/** 解析 AI 返回的四个层级 */
function parseFourLevels(content: string): Record<InsightLevel, string> {
  const result: Record<InsightLevel, string> = {
    causal: '',
    behavioral: '',
    transition: '',
    personal_model: '',
  };

  const sections = content.split(/---(\w+)---/);
  for (let i = 1; i < sections.length; i += 2) {
    const key = sections[i].toLowerCase();
    const text = sections[i + 1]?.trim() ?? '';
    if (key === 'causal') result.causal = text;
    else if (key === 'behavioral') result.behavioral = text;
    else if (key === 'transition') result.transition = text;
    else if (key === 'personal') result.personal_model = text;
  }

  // 如果解析失败，把全文放进 causal 作为兜底
  if (!result.causal && !result.behavioral && !result.transition && !result.personal_model) {
    result.causal = content.trim();
  }

  return result;
}

/** 构建数据提示词 */
function buildDataPrompt(
  sessions: ReturnType<typeof getAllSessions>,
  baseline: ReturnType<typeof useBaseline>,
): string {
  const byDate = new Map<string, typeof sessions>();
  sessions.forEach((s) => {
    const d = s.timestamp.slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(s);
  });

  const dates = [...byDate.keys()].sort();
  const lines: string[] = [];

  dates.forEach((date) => {
    const ss = byDate.get(date)!;
    const avgCPU = ss.reduce((s, r) => s + r.brain.thinkingSpeed, 0) / ss.length;
    const avgEnergy = ss.reduce((s, r) => s + r.body.energy, 0) / ss.length;
    const avgSensory = ss.reduce((s, r) =>
      s + r.sensory.soundOverload + r.sensory.lightOverload + r.sensory.socialOverload + r.sensory.infoOverload, 0
    ) / ss.length;
    const behaviors = [...new Set(ss.flatMap((s) => Object.entries(s.behavior).filter(([, v]) => v).map(([k]) => k)))];
    lines.push(`[${date}] sessions=${ss.length} CPU=${avgCPU.toFixed(1)} Energy=${avgEnergy.toFixed(1)} Sensory=${avgSensory.toFixed(1)} behaviors=${behaviors.join(',') || 'none'}`);
  });

  let prompt = `## Historical Data (${dates.length} days, ${sessions.length} sessions)\n`;
  prompt += lines.slice(-90).join('\n');

  if (baseline) {
    prompt += `\n\n## 30-Day Baseline\n`;
    prompt += `CPU avg: ${baseline.thinkingSpeedAvg.toFixed(1)} (±${baseline.deviations.thinkingSpeed.toFixed(1)})\n`;
    prompt += `Energy avg: ${baseline.energyAvg.toFixed(1)} (±${baseline.deviations.energy.toFixed(1)})\n`;
  }

  return prompt;
}

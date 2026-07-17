import { useState, useMemo } from 'react';
import { Brain, Eye, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useBaseline } from '../../hooks/useBaseline';
import { useConfig } from '../../hooks/useConfig';
import { getAllSessions } from '../../lib/storage';
import { normalizeUrl } from '../../lib/utils';

type InsightLevel = 'changes' | 'combos' | 'behaviors' | 'uncertain' | 'next';

const levelInfo: Record<InsightLevel, { title: string; desc: string; icon: typeof Brain }> = {
  changes: { title: '这段时间最明显的变化', desc: '', icon: Eye },
  combos: { title: '哪些组合值得注意', desc: '', icon: AlertTriangle },
  behaviors: { title: '行为通常在什么状态下出现', desc: '', icon: Brain },
  uncertain: { title: '目前还不能确定的事情', desc: '', icon: RefreshCw },
  next: { title: '接下来可以观察什么', desc: '', icon: Eye },
};

/**
 * Insight Engine — 深度分析
 *
 * 前置条件：≥7 天 + ≥7 次签到 + AI API 已配置
 */
export function InsightEngine() {
  const { config } = useConfig();
  const baseline = useBaseline(30);

  const [results, setResults] = useState<Record<InsightLevel, string | null>>({
    changes: null, combos: null, behaviors: null, uncertain: null, next: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // 数据自查
      const dataIssues = checkDataQuality(allSessions);

      const systemPrompt = buildSystemPrompt(dataIssues);
      const userPrompt = buildUserPrompt(allSessions, baseline);

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
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`API 返回 ${response.status}\n请求: ${apiUrl}\n${body.slice(0, 300)}`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? '';

      const parsed = parseSections(content);
      setResults(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completeCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-panel-border bg-panel-card p-4 space-y-2">
        <h3 className="text-xs font-medium text-slate-400 mb-2">前置条件</h3>
        <Prerequisite met={prerequisites.dataSufficient} label={`数据量：${prerequisites.totalDays} 天 / ${prerequisites.totalSessions} 次签到`} requirement="需要 ≥7 天且 ≥7 次签到" />
        <Prerequisite met={prerequisites.apiConfigured} label="AI API 已配置并启用" requirement="在「API 配置」中设置端点和 Key" />
        <Prerequisite met={!!baseline} label={baseline ? '基线已建立' : '基线未建立'} requirement="需要足够的近期数据来计算基线" />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!canRun || isAnalyzing}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 py-3 font-medium text-sm hover:bg-purple-500/20 transition-colors disabled:opacity-40 min-h-touch"
      >
        {isAnalyzing ? (
          <><Loader2 className="h-4 w-4 animate-spin" />分析中…（可能需要 30-60 秒）</>
        ) : completeCount > 0 ? (
          <><RefreshCw className="h-4 w-4" />重新分析（{completeCount}/5 已完成）</>
        ) : (
          <><Brain className="h-4 w-4" />运行深度分析</>
        )}
      </button>

      <div className="space-y-3">
        {(Object.entries(levelInfo) as [InsightLevel, typeof levelInfo[InsightLevel]][]).map(([level, info]) => {
          const Icon = info.icon;
          const content = results[level];
          return (
            <div key={level} className={`rounded-xl border p-4 ${content ? 'border-purple-500/20 bg-purple-500/5' : 'border-panel-border bg-panel-card opacity-50'}`}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${content ? 'text-purple-400' : 'text-slate-600'}`} />
                <span className={`text-xs font-medium ${content ? 'text-purple-300' : 'text-slate-500'}`}>{info.title}</span>
                {content && <span className="ml-auto text-[10px] text-purple-400">●</span>}
              </div>
              {content ? (
                <p className="text-sm leading-relaxed whitespace-pre-line text-slate-300">{content}</p>
              ) : (
                <p className="text-xs text-slate-600">等待分析…</p>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs text-red-400 whitespace-pre-wrap break-all">{error}</p>
        </div>
      )}
    </div>
  );
}

// ====== 辅助组件 ======

function Prerequisite({ met, label, requirement }: { met: boolean; label: string; requirement: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      {met ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-slate-600 mt-0.5 shrink-0" />}
      <div>
        <span className={met ? 'text-slate-300' : 'text-slate-500'}>{label}</span>
        {!met && <span className="ml-2 text-[10px] text-slate-600">{requirement}</span>}
      </div>
    </div>
  );
}

// ====== 数据分析 ======

/** 检测数据质量问题 */
function checkDataQuality(sessions: ReturnType<typeof getAllSessions>): string[] {
  const issues: string[] = [];

  // 检查零值
  const zeros = sessions.filter((s) => s.brain.thinkingSpeed === 0 || s.body.energy === 0);
  if (zeros.length > 0) {
    issues.push(`有 ${zeros.length} 次记录的 CPU 或精力为 0，可能是缺失数据而非真实值。分析时请注意这一点，不要将 0 值纳入结论。`);
  }

  // 检查样本量
  const totalDays = new Set(sessions.map((s) => s.timestamp.slice(0, 10))).size;
  if (totalDays < 14) {
    issues.push(`目前只有 ${totalDays} 天数据，样本量较小。请不要使用"必然""证明""明确说明"等确定性表述。使用"可能""目前出现过""值得继续观察"。`);
  }

  // 检查连续记录天数
  const dates = [...new Set(sessions.map((s) => s.timestamp.slice(0, 10)))].sort();
  let maxGap = 0;
  for (let i = 1; i < dates.length; i++) {
    const gap = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
    if (gap > maxGap) maxGap = gap;
  }
  if (maxGap > 3) {
    issues.push(`数据中存在超过 ${Math.round(maxGap)} 天的间隔，中间没有记录。跨这些间隔的结论需要注明"中间缺少记录"。`);
  }

  return issues;
}

/** 构建系统提示词 */
function buildSystemPrompt(dataIssues: string[]): string {
  const issueText = dataIssues.length > 0
    ? `\n\n## 数据质量提醒\n${dataIssues.map((i) => '- ' + i).join('\n')}`
    : '';

  return `你不是治疗师，不是心理咨询师，不是医生。你是一个帮助用户理解自己数据规律的分析工具。

## 核心规则

1. 全部使用简体中文，用大白话。每句话尽量只表达一个意思。
2. 用"你"，不要用"该用户"。
3. 不要模仿医学诊断、心理评估报告、学术论文。
4. 每段先说结论，再用具体日期和数字解释。
5. 不能确定的事，明确写"目前看起来……""可能……""暂时还不能确定……"。

## 禁止使用的词和表达
不要出现以下任何词：前因、后果、抑制效应、认知资源耗尽、神经状态、核心脆弱点、状态转换链条、高唤醒状态、基线偏离、资源保护模式、随后导致、必然、几乎一定、证明了、明确说明、核心规律。

## 因果关系规则（非常重要）

数据同时出现，不等于一件事导致了另一件事。

你必须区分三种情况：
- "同一天一起出现"：例如"7月6日感官负荷较高，同时CPU和精力较低。"
- "前一天和后一天的变化"：例如"7月6日感官负荷较高，7月7日CPU发生变化。"
- "连续几天积累后出现变化"：只有连续记录支持时才能写"可能存在几天累积后的影响"。

不要把同一天的数据写成"随后导致"或"造成"。

如果你看到某种行为之后出现低谷，至少需要提供两种以上可能的解释，不要只写一种。例如"启动多个项目"之后CPU下降：
- 启动太多项目可能消耗了精力
- 也可能只是当时本身就在波动
- 可能和其他因素（比如同时感官负荷高、睡眠少）一起作用

最后写："现在还不能确定是哪一种，需要更多重复记录。"

## 数学和日期检查

生成结论前请确认：数字大小关系正确（不能说1.8高于1.9），日期顺序正确（不能把当天的事写成第二天的事）。如果数据中的0值可能是缺失记录而非真实值，请注明并排除。

## 输出格式

请按照以下五个部分输出。用"## 1."这样的标题。每个部分之间用空行分隔。${issueText}

## 1. 这段时间最明显的变化
用2-4句话概括。示例："这段时间里，感官负荷较高的日子，CPU和精力也更容易偏低。尤其是感官负荷超过11时，启动困难和回避沟通出现得更多。不过目前只有十几天记录，还不能确定它们之间的关系。"

## 2. 哪些组合值得注意
最多列3组。每组用这种格式：
### 感官高 + CPU低
- 出现日期：
- 当时发生了什么：
- 目前可以怎么理解：
- 可信程度：低 / 中 / 较高

## 3. 行为通常在什么状态下出现
每个行为用大白话解释。例如："启动困难目前主要出现在感官负荷较高、CPU不超过2的时候。7月12日虽然感官负荷高但CPU为3，没有出现启动困难。这说明CPU较高时可能还能暂时撑住。"

## 4. 目前还不能确定的事情
主动列出不确定性，例如：数据天数太少、某些日期中间没有记录、0值可能是缺失数据、同一天的数据不能证明因果关系、行为发生和状态变化之间可能还有其他原因。

## 5. 接下来可以观察什么
最多给3条具体建议。例如："当感官负荷超过10时，观察第二天和第三天的CPU和精力有没有稳定下降。"`;
}

/** 构建用户数据提示词 */
function buildUserPrompt(
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
  const dateLabels = dates.map((d) => {
    const dObj = new Date(d);
    return `${dObj.getMonth() + 1}月${dObj.getDate()}日`;
  });

  const lines: string[] = [];
  dates.forEach((date, idx) => {
    const ss = byDate.get(date)!;
    const n = ss.length;
    const avgCPU = +(ss.reduce((s, r) => s + r.brain.thinkingSpeed, 0) / n).toFixed(1);
    const avgEnergy = +(ss.reduce((s, r) => s + r.body.energy, 0) / n).toFixed(1);
    const avgSensory = +(ss.reduce((s, r) =>
      s + r.sensory.soundOverload + r.sensory.lightOverload + r.sensory.socialOverload + r.sensory.infoOverload, 0
    ) / n).toFixed(1);
    const behaviors = [...new Set(ss.flatMap((s) => Object.entries(s.behavior).filter(([, v]) => v).map(([k]) => k)))];
    lines.push(`${dateLabels[idx]} | ${n}次 | CPU ${avgCPU} | 精力 ${avgEnergy} | 感官 ${avgSensory} | 行为: ${behaviors.join(',') || '无'}`);
  });

  let prompt = `## 全部记录（${dates.length} 天，${sessions.length} 次签到）\n`;
  prompt += lines.join('\n');

  if (baseline) {
    prompt += `\n\n## 30天参考值\nCPU 平均 ${baseline.thinkingSpeedAvg.toFixed(1)} | 精力平均 ${baseline.energyAvg.toFixed(1)} | 感官平均 ${baseline.sensoryLoadAvg.toFixed(1)}`;
  }

  return prompt;
}

/** 解析 AI 返回的五个部分 */
function parseSections(content: string): Record<InsightLevel, string> {
  const result: Record<InsightLevel, string> = {
    changes: '', combos: '', behaviors: '', uncertain: '', next: '',
  };

  const sectionMap: [RegExp, InsightLevel][] = [
    [/##?\s*1[\.\s、].*?最明显的变化/i, 'changes'],
    [/##?\s*2[\.\s、].*?组合值得注意/i, 'combos'],
    [/##?\s*3[\.\s、].*?行为通常/i, 'behaviors'],
    [/##?\s*4[\.\s、].*?不能确定/i, 'uncertain'],
    [/##?\s*5[\.\s、].*?接下来/i, 'next'],
  ];

  // 按标题切分
  const parts = content.split(/(?=##?\s*\d[\.\s、])/);
  parts.forEach((part) => {
    for (const [pattern, key] of sectionMap) {
      if (pattern.test(part)) {
        result[key] = part.replace(pattern, '').trim();
        return;
      }
    }
  });

  // 如果没解析到任何部分，全文放 changes
  if (!Object.values(result).some(Boolean)) {
    result.changes = content.trim();
  }

  return result;
}

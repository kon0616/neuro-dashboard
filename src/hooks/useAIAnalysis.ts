import { useState, useCallback } from 'react';
import type { PatternInsight, AIConfig } from '../types/ai';
import type { Session } from '../types/session';
import type { Baseline } from '../types/analytics';
import { getAIConfig, getInsights, saveInsights } from '../lib/storage';
import { normalizeUrl } from '../lib/utils';

/** 构建 AI 分析的提示词 */
function buildPrompt(
  baseline: Baseline | null,
  recentSessions: Session[],
  dailyDifferences: Record<string, string>
): string {
  const sessionLines = recentSessions.map((s) => {
    const date = s.timestamp.slice(0, 10);
    const behaviorStr = Object.entries(s.behavior)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(',');
    const sensoryTotal =
      s.sensory.soundOverload +
      s.sensory.lightOverload +
      s.sensory.socialOverload +
      s.sensory.infoOverload;
    return `[${date}] [${s.period}] thinking=${s.brain.thinkingSpeed} energy=${s.body.energy} sleep=${s.body.sleepHours}h sensory=${sensoryTotal} behaviors=${behaviorStr} projects=${s.brain.activeProjects}`;
  });

  const diffLines = Object.entries(dailyDifferences)
    .filter(([, v]) => v)
    .map(([date, text]) => `[${date}]: "${text}"`)
    .join('\n');

  return `You are a pattern detection engine, NOT a therapist or medical professional.
Your role is strictly to find statistical correlations in nervous system tracking data.
- Identify patterns: "when X occurs, Y tends to follow"
- Highlight deviations from baseline
- NEVER diagnose, suggest treatments, or use clinical language
- NEVER use emotion labels (happy, sad, anxious, depressed)
- Use neutral, observational language
- Frame everything as "the data suggests" not "you are experiencing"
- If you cannot find clear patterns, say so honestly

## Baseline (14-day average)${baseline ? `
- Thinking speed: ${baseline.thinkingSpeedAvg.toFixed(1)} (±${baseline.deviations.thinkingSpeed.toFixed(1)})
- Energy: ${baseline.energyAvg.toFixed(1)} (±${baseline.deviations.energy.toFixed(1)})
- Sensory load: ${baseline.sensoryLoadAvg.toFixed(1)} (±${baseline.deviations.sensoryLoad.toFixed(1)})
- Sleep: ${baseline.sleepHoursAvg.toFixed(1)}h (±${baseline.deviations.sleepHours.toFixed(1)}h)` : 'Not enough data yet'}

## Recent Sessions
${sessionLines.join('\n') || 'No sessions yet'}

## Daily Notes
${diffLines || 'None'}

Find correlations and patterns. Output ONLY a JSON array: [{"type":"correlation|deviation|trend|warning","title":"...","description":"...","confidence":0.0-1.0,"relatedMetrics":["metric1","metric2"]}]`;
}

/**
 * AI 模式检测 hook
 * 支持本地检测（无需 API）和远程 AI 分析
 */
export function useAIAnalysis() {
  const [insights, setInsights] = useState<PatternInsight[]>(getInsights);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 本地检测：无需 API，使用规则引擎 */
  const analyzeLocal = useCallback(
    (sessions: Session[], baseline: Baseline | null, dailyDifferences: Record<string, string>) => {
      const localInsights: PatternInsight[] = [];

      if (!baseline) {
        localInsights.push({
          id: crypto.randomUUID(),
          type: 'trend',
          title: '数据积累中',
          description: '至少需要3天的记录才能建立基线。继续记录你的神经状态，模式会逐渐显现。',
          confidence: 1.0,
          relatedMetrics: [],
          createdAt: new Date().toISOString(),
        });
      }

      // 简单本地检测
      if (sessions.length >= 3 && baseline) {
        const recentSessions = sessions.slice(-3);
        const avgEnergy = recentSessions.reduce((s, r) => s + r.body.energy, 0) / recentSessions.length;
        if (Math.abs(avgEnergy - baseline.energyAvg) > baseline.deviations.energy * 1.5) {
          localInsights.push({
            id: crypto.randomUUID(),
            type: 'deviation',
            title: '精力水平偏离基线',
            description: `近期的精力水平与你的14天基线有显著差异。这可能是需要调整节奏的信号。`,
            confidence: 0.7,
            relatedMetrics: ['energy'],
            createdAt: new Date().toISOString(),
          });
        }
      }

      saveInsights(localInsights);
      setInsights(localInsights);
      return localInsights;
    },
    []
  );

  /** 远程 AI 分析 */
  const analyzeRemote = useCallback(
    async (
      sessions: Session[],
      baseline: Baseline | null,
      dailyDifferences: Record<string, string>
    ) => {
      const config = getAIConfig();
      if (!config.enabled || !config.apiKey) {
        throw new Error('AI 未配置。请在设置中配置 API。');
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const prompt = buildPrompt(baseline, sessions, dailyDifferences);

        const url = normalizeUrl(config.apiEndpoint);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          throw new Error(`${response.status} — 请求: ${url}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? '[]';

        // 尝试解析 JSON
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('无法解析 AI 响应');

        const parsed = JSON.parse(jsonMatch[0]) as PatternInsight[];
        const insightsWithId: PatternInsight[] = parsed.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }));

        saveInsights(insightsWithId);
        setInsights(insightsWithId);
        return insightsWithId;
      } catch (e) {
        const msg = e instanceof Error ? e.message : '分析失败';
        setError(msg);
        throw e;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  return { insights, isAnalyzing, error, analyzeLocal, analyzeRemote, setInsights };
}

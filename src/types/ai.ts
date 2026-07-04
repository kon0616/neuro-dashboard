/** AI 配置 */
export interface AIConfig {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  enabled: boolean;
}

/** AI 模式洞察 */
export interface PatternInsight {
  id: string;
  type: 'correlation' | 'deviation' | 'trend' | 'warning';
  title: string;
  description: string;
  confidence: number;
  relatedMetrics: string[];
  createdAt: string;
}

/** 默认 AI 配置 */
export function createDefaultAIConfig(): AIConfig {
  return {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-4o-mini',
    enabled: false,
  };
}

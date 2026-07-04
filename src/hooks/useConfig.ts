import { useState, useCallback } from 'react';
import type { AIConfig } from '../types/ai';
import { getAIConfig, saveAIConfig } from '../lib/storage';

/**
 * 管理用户配置（AI 设置等）
 */
export function useConfig() {
  const [config, setConfig] = useState<AIConfig>(getAIConfig);

  const updateConfig = useCallback((updates: Partial<AIConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      saveAIConfig(next);
      return next;
    });
  }, []);

  return { config, updateConfig };
}

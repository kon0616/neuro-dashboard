import { useState, useEffect, useCallback } from 'react';
import type { BehaviorDefinition } from '../types/behavior';
import { DEFAULT_BEHAVIORS } from '../constants/defaultBehaviors';
import {
  getBehaviorDefinitions,
  saveBehaviorDefinition,
  deleteBehaviorDefinition,
} from '../lib/storage';

/** 独立的行为标签查找（不依赖 React） */
export function getBehaviorLabel(id: string): string {
  const defs = getBehaviorDefinitions();
  const found = defs.find((b) => b.id === id);
  return found?.label ?? id;
}

/**
 * 管理行为定义（默认 + 自定义）
 */
export function useBehaviors() {
  const [behaviors, setBehaviors] = useState<BehaviorDefinition[]>(() => {
    const saved = getBehaviorDefinitions();
    return saved.length > 0 ? saved : DEFAULT_BEHAVIORS;
  });

  useEffect(() => {
    const saved = getBehaviorDefinitions();
    if (saved.length === 0) {
      DEFAULT_BEHAVIORS.forEach((b) => saveBehaviorDefinition(b));
      setBehaviors(DEFAULT_BEHAVIORS);
    } else {
      setBehaviors(saved);
    }
  }, []);

  const add = useCallback((def: BehaviorDefinition) => {
    saveBehaviorDefinition(def);
    setBehaviors(getBehaviorDefinitions());
  }, []);

  const update = useCallback((def: BehaviorDefinition) => {
    saveBehaviorDefinition(def);
    setBehaviors(getBehaviorDefinitions());
  }, []);

  const remove = useCallback((id: string) => {
    deleteBehaviorDefinition(id);
    setBehaviors(getBehaviorDefinitions());
  }, []);

  const defaultBehaviors = behaviors.filter((b) => b.isDefault);
  const customBehaviors = behaviors.filter((b) => !b.isDefault);

  /** 根据 ID 查找行为标签 */
  const getLabel = useCallback(
    (id: string): string => getBehaviorLabel(id),
    [behaviors]
  );

  return {
    behaviors,
    defaultBehaviors,
    customBehaviors,
    getLabel,
    add,
    update,
    remove,
  };
}

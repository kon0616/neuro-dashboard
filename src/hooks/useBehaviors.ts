import { useState, useEffect, useCallback } from 'react';
import type { BehaviorDefinition } from '../types/behavior';
import { DEFAULT_BEHAVIORS } from '../constants/defaultBehaviors';
import {
  getBehaviorDefinitions,
  saveBehaviorDefinition,
  deleteBehaviorDefinition,
} from '../lib/storage';

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
      // 首次加载：写入默认行为
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

  return {
    behaviors,
    defaultBehaviors,
    customBehaviors,
    add,
    update,
    remove,
  };
}

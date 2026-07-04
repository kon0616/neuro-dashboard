import type { BehaviorDefinition } from '../types/behavior';

/** v1 的 9 个默认行为，升级为 v2 BehaviorDefinition */
export const DEFAULT_BEHAVIORS: BehaviorDefinition[] = [
  { id: 'startedManyProjects', label: '启动多个新项目', category: 'activation', isDefault: true },
  { id: 'talkedMuchMore', label: '话量显著增加', category: 'activation', isDefault: true },
  { id: 'hyperfocused', label: '长时间高度专注', category: 'activation', isDefault: true },
  { id: 'forgotMeals', label: '忘记吃饭', category: 'activation', isDefault: true },
  { id: 'stayedUpLate', label: '熬夜', category: 'activation', isDefault: true },
  { id: 'impulseSpending', label: '冲动消费', category: 'activation', isDefault: true },
  { id: 'avoidedCommunication', label: '避免社交', category: 'shutdown', isDefault: true },
  { id: 'stayedInBed', label: '大部分时间卧床', category: 'shutdown', isDefault: true },
  { id: 'difficultyStartingTasks', label: '启动任务困难', category: 'shutdown', isDefault: true },
];

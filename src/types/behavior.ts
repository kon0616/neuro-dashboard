/** 行为定义 */
export interface BehaviorDefinition {
  id: string;
  label: string;
  category: 'activation' | 'shutdown' | 'neutral';
  isDefault: boolean;
}

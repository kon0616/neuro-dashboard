/** 事件类型定义 */
export interface EventTypeDefinition {
  id: string;
  label: string;
  icon: string;            // Lucide icon name
  isDefault: boolean;
}

/** 已记录的事件实例 */
export interface AppEvent {
  id: string;
  eventTypeId: string;
  timestamp: string;       // ISO 8601
  note?: string;
}

/** 创建默认事件 */
export function createEvent(eventTypeId: string, timestamp?: string): AppEvent {
  return {
    id: crypto.randomUUID(),
    eventTypeId,
    timestamp: timestamp ?? new Date().toISOString(),
  };
}

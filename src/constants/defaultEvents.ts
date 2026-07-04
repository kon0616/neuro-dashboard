import type { EventTypeDefinition } from '../types/event';

/** 8 个默认事件类型（替代 v1 的 "stress" 字段） */
export const DEFAULT_EVENT_TYPES: EventTypeDefinition[] = [
  { id: 'exam', label: '考试', icon: 'FileText', isDefault: true },
  { id: 'meeting', label: '会议', icon: 'Users', isDefault: true },
  { id: 'travel', label: '出行', icon: 'MapPin', isDefault: true },
  { id: 'hospital', label: '就医', icon: 'Stethoscope', isDefault: true },
  { id: 'conflict', label: '人际冲突', icon: 'MessageSquareWarning', isDefault: true },
  { id: 'long_outing', label: '长时间外出', icon: 'Sun', isDefault: true },
  { id: 'crowded', label: '拥挤环境', icon: 'UsersRound', isDefault: true },
  { id: 'deadline', label: '截止日期', icon: 'ClockAlert', isDefault: true },
];

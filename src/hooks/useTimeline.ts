import { useMemo } from 'react';
import type { DayRecord } from '../types/day';
import type { Session } from '../types/session';
import type { AppEvent } from '../types/event';
import { getEventLabel } from './useEvents';

/** 时间线条目 */
export type TimelineEntry =
  | { kind: 'session'; data: Session }
  | { kind: 'event'; data: AppEvent; label: string; icon: string };

/**
 * 合并会话和事件为按时间排序的时间线
 */
export function useTimeline(day: DayRecord | null) {
  return useMemo(() => {
    if (!day) return [];

    const entries: TimelineEntry[] = [
      ...day.sessions.map(
        (s) => ({ kind: 'session' as const, data: s })
      ),
      ...day.events.map((e) => ({
        kind: 'event' as const,
        data: e,
        label: getEventLabel(e.eventTypeId),
        icon: 'Circle',
      })),
    ];

    entries.sort(
      (a, b) =>
        new Date(a.data.timestamp).getTime() -
        new Date(b.data.timestamp).getTime()
    );

    return entries;
  }, [day]);
}

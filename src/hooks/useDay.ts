import { useState, useEffect, useCallback } from 'react';
import type { DayRecord } from '../types/day';
import type { Session } from '../types/session';
import type { AppEvent } from '../types/event';
import {
  getOrCreateDay,
  addSession as saveSession,
  updateSession as updateSessionInStorage,
  deleteSession as deleteSessionInStorage,
  addEvent as saveEvent,
  deleteEvent as deleteEventInStorage,
  setDailyDifference as saveDailyDifference,
} from '../lib/storage';
import { getToday } from '../lib/utils';

/**
 * 管理某日的 DayRecord（会话 + 事件 + 每日一句）
 */
export function useDay(date: string = getToday()) {
  const [day, setDay] = useState<DayRecord>(() => getOrCreateDay(date));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setDay(getOrCreateDay(date));
    setIsLoaded(true);
  }, [date]);

  const refresh = useCallback(() => {
    setDay(getOrCreateDay(date));
  }, [date]);

  const addSession = useCallback(
    (session: Session) => {
      saveSession(date, session);
      refresh();
    },
    [date, refresh]
  );

  const updateSession = useCallback(
    (sessionId: string, updates: Partial<Session>) => {
      updateSessionInStorage(date, sessionId, updates);
      refresh();
    },
    [date, refresh]
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      deleteSessionInStorage(date, sessionId);
      refresh();
    },
    [date, refresh]
  );

  const addEvent = useCallback(
    (event: AppEvent) => {
      saveEvent(date, event);
      refresh();
    },
    [date, refresh]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      deleteEventInStorage(date, eventId);
      refresh();
    },
    [date, refresh]
  );

  const setDifference = useCallback(
    (text: string) => {
      saveDailyDifference(date, text);
      refresh();
    },
    [date, refresh]
  );

  return {
    day,
    isLoaded,
    refresh,
    addSession,
    updateSession,
    deleteSession,
    addEvent,
    deleteEvent,
    setDifference,
  };
}

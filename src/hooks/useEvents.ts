import { useState, useEffect, useCallback } from 'react';
import type { EventTypeDefinition, AppEvent } from '../types/event';
import { createEvent } from '../types/event';
import { DEFAULT_EVENT_TYPES } from '../constants/defaultEvents';
import {
  getEventTypeDefinitions,
  saveEventTypeDefinition,
  deleteEventTypeDefinition,
  addEvent as saveEvent,
  getDay,
} from '../lib/storage';

/**
 * 管理事件类型定义
 */
export function useEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventTypeDefinition[]>(() => {
    const saved = getEventTypeDefinitions();
    return saved.length > 0 ? saved : DEFAULT_EVENT_TYPES;
  });

  useEffect(() => {
    const saved = getEventTypeDefinitions();
    if (saved.length === 0) {
      DEFAULT_EVENT_TYPES.forEach((e) => saveEventTypeDefinition(e));
      setEventTypes(DEFAULT_EVENT_TYPES);
    } else {
      setEventTypes(saved);
    }
  }, []);

  const add = useCallback((def: EventTypeDefinition) => {
    saveEventTypeDefinition(def);
    setEventTypes(getEventTypeDefinitions());
  }, []);

  const remove = useCallback((id: string) => {
    deleteEventTypeDefinition(id);
    setEventTypes(getEventTypeDefinitions());
  }, []);

  return { eventTypes, add, remove };
}

/**
 * 管理某日的事件记录
 */
export function useDayEvents(date: string) {
  const [events, setEvents] = useState<AppEvent[]>(() => {
    const day = getDay(date);
    return day?.events ?? [];
  });

  const refresh = useCallback(() => {
    const day = getDay(date);
    setEvents(day?.events ?? []);
  }, [date]);

  const logEvent = useCallback(
    (eventTypeId: string, note?: string) => {
      const event = createEvent(eventTypeId);
      if (note) event.note = note;
      saveEvent(date, event);
      refresh();
    },
    [date, refresh]
  );

  return { events, logEvent, refresh };
}

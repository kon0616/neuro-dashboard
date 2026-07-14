import { useState, useCallback, useEffect } from 'react';
import type { Session } from '../types/session';
import { createEmptySession } from '../types/session';
import {
  updateSession as updateSessionInStorage,
  deleteSession as deleteSessionInStorage,
  getSession,
  getAllSessions,
  getDay,
} from '../lib/storage';
import { getToday } from '../lib/utils';

/**
 * 管理当前正在编辑的会话
 */
export function useCurrentSession(date: string = getToday()) {
  const [session, setSession] = useState<Session>(() => createEmptySession());

  // 日期切换时重置表单
  useEffect(() => {
    setSession(createEmptySession());
  }, [date]);

  const newSession = useCallback(() => {
    setSession(createEmptySession());
  }, []);

  const updateSession = useCallback(
    <K extends keyof Session>(key: K, value: Session[K]) => {
      setSession((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateBrain = useCallback(
    (brain: Partial<Session['brain']>) => {
      setSession((prev) => ({
        ...prev,
        brain: { ...prev.brain, ...brain },
      }));
    },
    []
  );

  const updateBody = useCallback(
    (body: Partial<Session['body']>) => {
      setSession((prev) => ({
        ...prev,
        body: { ...prev.body, ...body },
      }));
    },
    []
  );

  const updateSensory = useCallback(
    (sensory: Partial<Session['sensory']>) => {
      setSession((prev) => ({
        ...prev,
        sensory: { ...prev.sensory, ...sensory },
      }));
    },
    []
  );

  const updateEnvironment = useCallback(
    (environment: Partial<Session['environment']>) => {
      setSession((prev) => ({
        ...prev,
        environment: { ...prev.environment, ...environment },
      }));
    },
    []
  );

  const toggleBehavior = useCallback((behaviorId: string, checked: boolean) => {
    setSession((prev) => ({
      ...prev,
      behavior: { ...prev.behavior, [behaviorId]: checked },
    }));
  }, []);

  const setNote = useCallback((note: string) => {
    setSession((prev) => ({ ...prev, note }));
  }, []);

  const setPeriod = useCallback((period: Session['period']) => {
    setSession((prev) => ({ ...prev, period }));
  }, []);

  const save = useCallback(() => {
    const now = new Date().toISOString();
    const toSave: Session = {
      ...session,
      id: session.id ?? crypto.randomUUID(),
      timestamp: session.timestamp || now,
      period: session.period || detectPeriod(now),
    };
    // 不在此处写存储 — 由调用方（useDay.addSession）统一处理持久化
    return toSave;
  }, [session]);

  const load = useCallback(
    (sessionId: string) => {
      const found = getSession(date, sessionId);
      if (found) setSession(found);
    },
    [date]
  );

  return {
    session,
    newSession,
    updateSession,
    updateBrain,
    updateBody,
    updateSensory,
    updateEnvironment,
    toggleBehavior,
    setNote,
    setPeriod,
    save,
    load,
  };
}

/**
 * 获取历史会话
 */
export function useSessionHistory(days: number = 30) {
  const [sessions, setSessions] = useState<Session[]>(() => getAllSessions());

  const refresh = useCallback(() => {
    setSessions(getAllSessions());
  }, []);

  const getSessionsByDate = useCallback((date: string): Session[] => {
    const day = getDay(date);
    return day?.sessions ?? [];
  }, []);

  return { sessions, refresh, getSessionsByDate };
}

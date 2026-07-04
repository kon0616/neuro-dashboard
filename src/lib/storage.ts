/**
 * v2 localStorage 存储层
 *
 * 扁平化存储设计：
 * - neuro-v2-days         → DayRecord[]
 * - neuro-v2-behaviors    → BehaviorDefinition[]
 * - neuro-v2-event-types  → EventTypeDefinition[]
 * - neuro-v2-ai-config    → AIConfig
 * - neuro-v2-insights     → PatternInsight[]
 */

import type { DayRecord } from '../types/day';
import type { Session } from '../types/session';
import { createEmptyDayRecord } from '../types/day';
import { createEmptySession } from '../types/session';
import type { AppEvent } from '../types/event';
import type { BehaviorDefinition } from '../types/behavior';
import type { EventTypeDefinition } from '../types/event';
import type { AIConfig, PatternInsight } from '../types/ai';

// === Keys ===
const K_DAYS = 'neuro-v2-days';
const K_BEHAVIORS = 'neuro-v2-behaviors';
const K_EVENT_TYPES = 'neuro-v2-event-types';
const K_AI_CONFIG = 'neuro-v2-ai-config';
const K_INSIGHTS = 'neuro-v2-insights';

// === Generic helpers ===
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// === Day Records ===
/** 确保旧数据兼容：补全缺失的字段 */
function normalizeDay(day: DayRecord): DayRecord {
  if (!day.sleep) {
    day.sleep = { hours: 7, quality: 3 };
  }
  if (!day.dailyDifference && day.dailyDifference !== '') {
    day.dailyDifference = '';
  }
  return day;
}

export function getAllDays(): DayRecord[] {
  return read<DayRecord[]>(K_DAYS, []).map(normalizeDay);
}

export function getDay(date: string): DayRecord | null {
  const days = getAllDays();
  const day = days.find((d) => d.date === date);
  return day ? normalizeDay(day) : null;
}

export function getOrCreateDay(date: string): DayRecord {
  const existing = getDay(date);
  if (existing) return normalizeDay(existing);
  const day = createEmptyDayRecord(date);
  saveDay(day);
  return day;
}

export function saveDay(day: DayRecord): void {
  const days = getAllDays();
  const idx = days.findIndex((d) => d.date === day.date);
  if (idx >= 0) {
    days[idx] = day;
  } else {
    days.push(day);
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  write(K_DAYS, days);
}

export function getDaysInRange(numDays: number): DayRecord[] {
  const days = getAllDays();
  const dates: string[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates.map((date) => {
    const existing = days.find((d) => d.date === date);
    const day = existing ?? createEmptyDayRecord(date);
    // 兼容旧数据：确保 sleep 字段存在
    if (!day.sleep) {
      day.sleep = { hours: 7, quality: 3 };
    }
    return day;
  });
}

// === Sessions ===
export function addSession(date: string, session: Session): void {
  const day = getOrCreateDay(date);
  day.sessions.push(session);
  day.sessions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  saveDay(day);
}

export function updateSession(date: string, sessionId: string, updates: Partial<Session>): void {
  const day = getOrCreateDay(date);
  const idx = day.sessions.findIndex((s) => s.id === sessionId);
  if (idx >= 0) {
    day.sessions[idx] = { ...day.sessions[idx], ...updates };
    saveDay(day);
  }
}

export function deleteSession(date: string, sessionId: string): void {
  const day = getDay(date);
  if (!day) return;
  day.sessions = day.sessions.filter((s) => s.id !== sessionId);
  saveDay(day);
}

export function getSession(date: string, sessionId: string): Session | null {
  const day = getDay(date);
  if (!day) return null;
  return day.sessions.find((s) => s.id === sessionId) ?? null;
}

export function getAllSessions(): Session[] {
  const days = getAllDays();
  return days.flatMap((d) => d.sessions);
}

// === Events ===
export function addEvent(date: string, event: AppEvent): void {
  const day = getOrCreateDay(date);
  day.events.push(event);
  day.events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  saveDay(day);
}

export function deleteEvent(date: string, eventId: string): void {
  const day = getDay(date);
  if (!day) return;
  day.events = day.events.filter((e) => e.id !== eventId);
  saveDay(day);
}

// === Daily Difference ===
export function getDailyDifference(date: string): string {
  const day = getDay(date);
  return day?.dailyDifference ?? '';
}

export function setDailyDifference(date: string, text: string): void {
  const day = getOrCreateDay(date);
  day.dailyDifference = text;
  saveDay(day);
}

// === Sleep ===
export function getSleep(date: string): { hours: number; quality: number } {
  const day = getDay(date);
  return day?.sleep ?? { hours: 7, quality: 3 };
}

export function setSleep(date: string, hours: number, quality: number): void {
  const day = getOrCreateDay(date);
  day.sleep = { hours, quality };
  saveDay(day);
}

// === Behavior Definitions ===
export function getBehaviorDefinitions(): BehaviorDefinition[] {
  return read<BehaviorDefinition[]>(K_BEHAVIORS, []);
}

export function saveBehaviorDefinition(def: BehaviorDefinition): void {
  const defs = getBehaviorDefinitions();
  const idx = defs.findIndex((d) => d.id === def.id);
  if (idx >= 0) {
    defs[idx] = def;
  } else {
    defs.push(def);
  }
  write(K_BEHAVIORS, defs);
}

export function deleteBehaviorDefinition(id: string): void {
  const defs = getBehaviorDefinitions().filter((d) => d.id !== id);
  write(K_BEHAVIORS, defs);
}

// === Event Type Definitions ===
export function getEventTypeDefinitions(): EventTypeDefinition[] {
  return read<EventTypeDefinition[]>(K_EVENT_TYPES, []);
}

export function saveEventTypeDefinition(def: EventTypeDefinition): void {
  const defs = getEventTypeDefinitions();
  const idx = defs.findIndex((d) => d.id === def.id);
  if (idx >= 0) {
    defs[idx] = def;
  } else {
    defs.push(def);
  }
  write(K_EVENT_TYPES, defs);
}

export function deleteEventTypeDefinition(id: string): void {
  const defs = getEventTypeDefinitions().filter((d) => d.id !== id);
  write(K_EVENT_TYPES, defs);
}

// === AI Config ===
export function getAIConfig(): AIConfig {
  return read<AIConfig>(K_AI_CONFIG, {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-4o-mini',
    enabled: false,
  });
}

export function saveAIConfig(config: AIConfig): void {
  write(K_AI_CONFIG, config);
}

// === AI Insights ===
export function getInsights(): PatternInsight[] {
  return read<PatternInsight[]>(K_INSIGHTS, []);
}

export function saveInsights(insights: PatternInsight[]): void {
  write(K_INSIGHTS, insights);
}

export function addInsight(insight: PatternInsight): void {
  const insights = getInsights();
  insights.push(insight);
  write(K_INSIGHTS, insights);
}

// === v1 backward compat (for migration) ===
export function getV1Records(): unknown[] {
  try {
    const raw = localStorage.getItem('neuro-dashboard-records');
    if (!raw) return [];
    return JSON.parse(raw) as unknown[];
  } catch {
    return [];
  }
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合并 Tailwind 类名，处理冲突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 获取今天的日期字符串 YYYY-MM-DD */
export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 格式化日期为可读格式 */
export function formatDate(dateStr: string, locale: string = 'zh-CN'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

/** 格式化日期为完整格式 */
export function formatDateFull(dateStr: string, locale: string = 'zh-CN'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

/** 获取过去 N 天的日期字符串数组 */
export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** 获取指定值对应的颜色类名 */
export function getLevelColor(value: number, max: number = 5): string {
  const ratio = value / max;
  if (ratio <= 0.2) return 'text-blue-400';
  if (ratio <= 0.4) return 'text-green-400';
  if (ratio <= 0.6) return 'text-yellow-400';
  if (ratio <= 0.8) return 'text-orange-400';
  return 'text-red-400';
}

/** 规范化 API URL：自动补全 https:// */
export function normalizeUrl(url: string): string {
  if (!url) return url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

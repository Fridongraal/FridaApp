import type { ReviewLog } from "../types";

export function formatDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return formatDateKey(Date.now());
}

export function calculateStreak(reviewLogs: ReviewLog[]): {
  currentStreak: number;
  reviewedTodayCount: number;
  isActiveToday: boolean;
} {
  if (!reviewLogs || reviewLogs.length === 0) {
    return { currentStreak: 0, reviewedTodayCount: 0, isActiveToday: false };
  }

  // Set of dates with at least 1 review
  const activeDays = new Set<string>();
  let todayCount = 0;
  const todayKey = getTodayDateKey();

  for (const log of reviewLogs) {
    const key = formatDateKey(log.timestamp);
    activeDays.add(key);
    if (key === todayKey) {
      todayCount++;
    }
  }

  const isActiveToday = activeDays.has(todayKey);

  // Check continuous streak backwards
  let streak = 0;
  const cursor = new Date();

  if (!isActiveToday) {
    // If user hasn't studied today, check if yesterday was active
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayKey = formatDateKey(cursor.getTime());
    if (!activeDays.has(yesterdayKey)) {
      return { currentStreak: 0, reviewedTodayCount: 0, isActiveToday: false };
    }
  }

  // Count backwards day by day
  while (true) {
    const key = formatDateKey(cursor.getTime());
    if (activeDays.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak: streak,
    reviewedTodayCount: todayCount,
    isActiveToday,
  };
}

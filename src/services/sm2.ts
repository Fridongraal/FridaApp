import type { Flashcard, ReviewRating } from "../types";

export interface SM2Result {
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: number;
  state: Flashcard["state"];
}

/**
 * Calculates the next review date and parameters using the streamlined 3-rating SM-2 algorithm:
 * 1: Repetir (Olvidada)
 * 2: Me costó (Dudó)
 * 3: Lo sé (Recordada con claridad)
 */
export function calculateSM2(card: Flashcard, rating: ReviewRating): SM2Result {
  const { interval, repetition, easeFactor } = card;
  let newEaseFactor = easeFactor;
  let newInterval: number;
  let newRepetition: number;
  let newState: Flashcard["state"] = card.state;

  if (rating === 1) {
    // 1: Repetir - Lapse
    newRepetition = 0;
    newInterval = 1; // Mañana
    newEaseFactor = Math.max(1.3, easeFactor - 0.25);
    newState = "learning";
  } else if (rating === 2) {
    // 2: Me costó - Hard
    newRepetition = Math.max(1, repetition);
    newInterval = Math.max(1, Math.round(interval * 1.25));
    newEaseFactor = Math.max(1.3, easeFactor - 0.12);
    newState = "learning";
  } else {
    // 3: Lo sé - Clear recall
    if (repetition === 0) {
      newInterval = 2; // Empieza con 2 días
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetition = repetition + 1;
    newEaseFactor = Number(Math.min(2.8, easeFactor + 0.1).toFixed(2));
    newState = "review";
  }

  // Calculate timestamp: now + interval in days (in ms)
  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const dueDate = now + newInterval * oneDayMs;

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    dueDate,
    state: newState,
  };
}

/**
 * Helper to display human-friendly intervals for study buttons
 */
export function formatIntervalPreview(days: number): string {
  if (days <= 1) return "1 d";
  if (days < 7) return `${days} d`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} ${weeks === 1 ? "sem" : "sem"}`;
  }
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}

/**
 * Returns formatted interval previews for all 3 ratings
 */
export function getIntervalPreviews(
  card: Flashcard,
): Record<ReviewRating, string> {
  return {
    1: "1 d",
    2: formatIntervalPreview(calculateSM2(card, 2).interval),
    3: formatIntervalPreview(calculateSM2(card, 3).interval),
  };
}

import type { Flashcard, ReviewRating } from "../types";

export interface SM2Result {
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: number;
  state: Flashcard["state"];
  inSessionRepeat: boolean;
  intervalLabel: string;
}

/**
 * Formats a duration in days into a concise Anki-style string.
 */
export function formatIntervalPreview(days: number): string {
  if (days <= 1) return "1 d";
  if (days < 30) return `${days} d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = (days / 365).toFixed(1);
  return `${years} a`;
}

/**
 * Calculates next review parameters following the exact Anki spaced-repetition model:
 *
 * Ratings:
 * 1: Otra vez (Again) -> "< 1 min" (re-queues in session; lapses to learning)
 * 2: Difícil (Hard)   -> "10 min" (if new/learning: step 2, re-queues in session; if review: 1.2x interval)
 * 3: Bien (Good)      -> "1 d" (graduates to 1 day; if review: interval * easeFactor)
 * 4: Fácil (Easy)     -> "4 d" (graduates to 4 days; if review: interval * easeFactor * 1.3)
 */
export function calculateSM2(card: Flashcard, rating: ReviewRating): SM2Result {
  const { interval, repetition, easeFactor, state } = card;
  const isReviewCard = state === "review" && interval >= 1 && repetition >= 1;
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  let newInterval: number;
  let newRepetition: number;
  let newEaseFactor: number = easeFactor || 2.5;
  let newState: Flashcard["state"];
  let inSessionRepeat: boolean;
  let intervalLabel: string;

  if (rating === 1) {
    // 1: Otra vez (Again) -> < 1 min, repeats in current session
    inSessionRepeat = true;
    newRepetition = 0;
    newInterval = 1; // Due tomorrow once graduated/session ends
    newEaseFactor = Number(Math.max(1.3, newEaseFactor - 0.2).toFixed(2));
    newState = "learning";
    intervalLabel = "< 1 min";
  } else if (rating === 2) {
    // 2: Difícil (Hard)
    if (!isReviewCard) {
      // New or learning card: step 2 (10 min), repeats in current session
      inSessionRepeat = true;
      newRepetition = 0;
      newInterval = 1;
      newEaseFactor = Number(Math.max(1.3, newEaseFactor - 0.15).toFixed(2));
      newState = "learning";
      intervalLabel = "10 min";
    } else {
      // Review card: 1.2x interval, does not repeat in session
      inSessionRepeat = false;
      newRepetition = repetition + 1;
      newInterval = Math.max(1, Math.round(interval * 1.2));
      newEaseFactor = Number(Math.max(1.3, newEaseFactor - 0.15).toFixed(2));
      newState = "review";
      intervalLabel = formatIntervalPreview(newInterval);
    }
  } else if (rating === 3) {
    // 3: Bien (Good)
    inSessionRepeat = false;
    if (!isReviewCard) {
      // Graduating interval: 1 day
      newInterval = 1;
      newRepetition = 1;
      newState = "review";
      intervalLabel = "1 d";
    } else {
      // Review card: interval * easeFactor
      newInterval = Math.max(1, Math.round(interval * newEaseFactor));
      newRepetition = repetition + 1;
      newEaseFactor = Number(Math.min(2.8, newEaseFactor + 0.05).toFixed(2));
      newState = "review";
      intervalLabel = formatIntervalPreview(newInterval);
    }
  } else {
    // 4: Fácil (Easy)
    inSessionRepeat = false;
    if (!isReviewCard) {
      // Easy graduating interval: 4 days
      newInterval = 4;
      newRepetition = 1;
      newEaseFactor = Number(Math.min(2.8, newEaseFactor + 0.15).toFixed(2));
      newState = "review";
      intervalLabel = "4 d";
    } else {
      // Review card: interval * easeFactor * 1.3
      newInterval = Math.max(4, Math.round(interval * newEaseFactor * 1.3));
      newRepetition = repetition + 1;
      newEaseFactor = Number(Math.min(2.8, newEaseFactor + 0.15).toFixed(2));
      newState = "review";
      intervalLabel = formatIntervalPreview(newInterval);
    }
  }

  const dueDate = now + newInterval * oneDayMs;

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: newEaseFactor,
    dueDate,
    state: newState,
    inSessionRepeat,
    intervalLabel,
  };
}

/**
 * Returns formatted interval previews for all 4 ratings (Anki format)
 */
export function getIntervalPreviews(card: Flashcard): Record<ReviewRating, string> {
  return {
    1: calculateSM2(card, 1).intervalLabel,
    2: calculateSM2(card, 2).intervalLabel,
    3: calculateSM2(card, 3).intervalLabel,
    4: calculateSM2(card, 4).intervalLabel,
  };
}

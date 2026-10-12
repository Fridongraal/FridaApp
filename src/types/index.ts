export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface Unit {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  order: number;
  createdAt: number;
}

export type CardState = "new" | "learning" | "review";

export interface Flashcard {
  id: string;
  subjectId: string;
  unitId: string;
  front: string;
  back: string;
  hint?: string;
  tags?: string[];
  createdAt: number;
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: number;
  lastReviewed?: number;
  state: CardState;
}

export type ReviewRating = 1 | 2 | 3 | 4;

export interface ReviewLog {
  id: string;
  cardId: string;
  rating: ReviewRating;
  timestamp: number;
  interval: number;
  easeFactor: number;
}

export interface DailyStats {
  date: string;
  count: number;
}

export type AppTheme = "original" | "windows-95" | "frutiger-aero" | "windows-vista";

export interface UserPreferences {
  dailyGoal: number;
  soundEnabled: boolean;
  hasSeenTutorial: boolean;
  userName?: string;
  userAvatar?: string;
  userBio?: string;
  joinedDate?: number;
  unlockedAchievementIds?: string[];
  theme?: AppTheme;
}

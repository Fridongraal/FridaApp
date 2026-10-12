import type { UserPreferences, Subject, Flashcard, ReviewLog } from "../types";

export type AchievementType = "task" | "goal" | "challenge";

export interface Achievement {
  id: string;
  branch: "memory" | "streak" | "creator" | "mastery";
  branchTitle: string;
  level: number;
  title: string;
  description: string;
  icon: string;
  type: AchievementType;
  parentId?: string;
  check: (stats: AchievementEvaluationStats) => boolean;
}

export interface AchievementEvaluationStats {
  totalReviews: number;
  currentStreak: number;
  cardsCount: number;
  subjectsCount: number;
  hasCustomProfile: boolean;
  easyRatingsCount: number;
  hasCompletedSession: boolean;
  hasCramSession: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Branch 1: Memoria y Repasos
  {
    id: "rev_1",
    branch: "memory",
    branchTitle: "El Camino del Recuerdo",
    level: 1,
    title: "Primer Recuerdo",
    description: "Repasa tu 1ª tarjeta de memoria.",
    icon: "🌱",
    type: "task",
    check: (s) => s.totalReviews >= 1,
  },
  {
    id: "rev_10",
    branch: "memory",
    branchTitle: "El Camino del Recuerdo",
    level: 2,
    title: "Calentando Motores",
    description: "Completa 10 repasos de tarjetas.",
    icon: "⚡",
    type: "task",
    parentId: "rev_1",
    check: (s) => s.totalReviews >= 10,
  },
  {
    id: "rev_50",
    branch: "memory",
    branchTitle: "El Camino del Recuerdo",
    level: 3,
    title: "Mente en Expansión",
    description: "Alcanza 50 tarjetas repasadas.",
    icon: "🧠",
    type: "goal",
    parentId: "rev_10",
    check: (s) => s.totalReviews >= 50,
  },
  {
    id: "rev_150",
    branch: "memory",
    branchTitle: "El Camino del Recuerdo",
    level: 4,
    title: "Dominio del Espaciado",
    description: "Consolida 150 repasos en tu trayectoria.",
    icon: "💎",
    type: "goal",
    parentId: "rev_50",
    check: (s) => s.totalReviews >= 150,
  },
  {
    id: "rev_500",
    branch: "memory",
    branchTitle: "El Camino del Recuerdo",
    level: 5,
    title: "Memoria Fotográfica",
    description: "¡Una leyenda! Supera 500 repasos acumulados.",
    icon: "👑",
    type: "challenge",
    parentId: "rev_150",
    check: (s) => s.totalReviews >= 500,
  },

  // Branch 2: Constancia y Rachas
  {
    id: "str_1",
    branch: "streak",
    branchTitle: "La Llama del Hábito",
    level: 1,
    title: "Chispa Inicial",
    description: "Inicia tu racha de estudio con 1 día activo.",
    icon: "✨",
    type: "task",
    check: (s) => s.currentStreak >= 1,
  },
  {
    id: "str_3",
    branch: "streak",
    branchTitle: "La Llama del Hábito",
    level: 2,
    title: "Fuego Constante",
    description: "Mantén una racha de 3 días consecutivos.",
    icon: "🔥",
    type: "task",
    parentId: "str_1",
    check: (s) => s.currentStreak >= 3,
  },
  {
    id: "str_7",
    branch: "streak",
    branchTitle: "La Llama del Hábito",
    level: 3,
    title: "Imparable",
    description: "Completa 1 semana completa (7 días) de racha sin fallar.",
    icon: "⚔️",
    type: "goal",
    parentId: "str_3",
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: "str_14",
    branch: "streak",
    branchTitle: "La Llama del Hábito",
    level: 4,
    title: "Hábito de Hierro",
    description: "Alcanza 14 días consecutivos aprendiendo.",
    icon: "🛡️",
    type: "goal",
    parentId: "str_7",
    check: (s) => s.currentStreak >= 14,
  },
  {
    id: "str_30",
    branch: "streak",
    branchTitle: "La Llama del Hábito",
    level: 5,
    title: "Leyenda del Fuego",
    description: "¡Un mes entero (30 días) de racha intachable!",
    icon: "🌟",
    type: "challenge",
    parentId: "str_14",
    check: (s) => s.currentStreak >= 30,
  },

  // Branch 3: Creación y Colección
  {
    id: "card_1",
    branch: "creator",
    branchTitle: "El Gran Creador",
    level: 1,
    title: "Primera Semilla",
    description: "Crea tu primera tarjeta de estudio.",
    icon: "📝",
    type: "task",
    check: (s) => s.cardsCount >= 1,
  },
  {
    id: "sub_2",
    branch: "creator",
    branchTitle: "El Gran Creador",
    level: 2,
    title: "Arquitecto del Saber",
    description: "Organiza tus estudios creando 2 materias.",
    icon: "📚",
    type: "task",
    parentId: "card_1",
    check: (s) => s.subjectsCount >= 2,
  },
  {
    id: "card_25",
    branch: "creator",
    branchTitle: "El Gran Creador",
    level: 3,
    title: "Coleccionista Curioso",
    description: "Alcanza 25 tarjetas en tu biblioteca.",
    icon: "📦",
    type: "goal",
    parentId: "sub_2",
    check: (s) => s.cardsCount >= 25,
  },
  {
    id: "sub_5",
    branch: "creator",
    branchTitle: "El Gran Creador",
    level: 4,
    title: "Polímata",
    description: "Crea 5 materias diferentes en Frida.",
    icon: "🏛️",
    type: "goal",
    parentId: "card_25",
    check: (s) => s.subjectsCount >= 5,
  },
  {
    id: "card_100",
    branch: "creator",
    branchTitle: "El Gran Creador",
    level: 5,
    title: "Códice Universal",
    description: "Supera las 100 tarjetas creadas en tu colección.",
    icon: "📜",
    type: "challenge",
    parentId: "sub_5",
    check: (s) => s.cardsCount >= 100,
  },

  // Branch 4: Identidad y Maestría
  {
    id: "prof_1",
    branch: "mastery",
    branchTitle: "Maestría con Frida",
    level: 1,
    title: "Identidad Propia",
    description: "Personaliza tu nombre o tu foto de perfil.",
    icon: "🎨",
    type: "task",
    check: (s) => s.hasCustomProfile,
  },
  {
    id: "study_1",
    branch: "mastery",
    branchTitle: "Maestría con Frida",
    level: 2,
    title: "Misión Cumplida",
    description: "Completa y finaliza una sesión de estudio entera.",
    icon: "🎯",
    type: "task",
    parentId: "prof_1",
    check: (s) => s.hasCompletedSession,
  },
  {
    id: "cram_1",
    branch: "mastery",
    branchTitle: "Maestría con Frida",
    level: 3,
    title: "Estudio Intrépido",
    description: "Repasa tarjetas activando el Modo Intensivo.",
    icon: "🌸",
    type: "goal",
    parentId: "study_1",
    check: (s) => s.hasCramSession,
  },
  {
    id: "easy_20",
    branch: "mastery",
    branchTitle: "Maestría con Frida",
    level: 4,
    title: "¡Eso fue Fácil!",
    description: "Obtén la calificación Fácil en 20 tarjetas distintas.",
    icon: "🏆",
    type: "challenge",
    parentId: "cram_1",
    check: (s) => s.easyRatingsCount >= 20,
  },
];

/**
 * Checks all achievements and returns newly unlocked ones
 */
export function evaluateAchievements(
  preferences: UserPreferences,
  subjects: Subject[],
  cards: Flashcard[],
  reviewLogs: ReviewLog[],
  currentStreak: number,
  flags?: { hasCompletedSession?: boolean; hasCramSession?: boolean }
): {
  newlyUnlocked: Achievement[];
  allUnlockedIds: string[];
} {
  const currentUnlockedSet = new Set(preferences.unlockedAchievementIds || []);

  const easyRatingsCount = reviewLogs.filter((l) => l.rating === 4).length;
  const hasCustomProfile = Boolean(
    (preferences.userName && preferences.userName !== "Estudiante") ||
      Boolean(preferences.userAvatar)
  );
  const hasCompletedSession =
    Boolean(flags?.hasCompletedSession) || reviewLogs.length > 0;
  const hasCramSession = Boolean(flags?.hasCramSession);

  const stats: AchievementEvaluationStats = {
    totalReviews: reviewLogs.length,
    currentStreak,
    cardsCount: cards.length,
    subjectsCount: subjects.length,
    hasCustomProfile,
    easyRatingsCount,
    hasCompletedSession,
    hasCramSession,
  };

  const newlyUnlocked: Achievement[] = [];
  const allUnlockedIds = new Set(currentUnlockedSet);

  // We evaluate in level order so child nodes unlock properly
  const sorted = [...ACHIEVEMENTS].sort((a, b) => a.level - b.level);

  for (const ach of sorted) {
    if (!allUnlockedIds.has(ach.id)) {
      // Check if parent is unlocked (or root)
      const parentUnlocked = !ach.parentId || allUnlockedIds.has(ach.parentId);
      if (parentUnlocked && ach.check(stats)) {
        allUnlockedIds.add(ach.id);
        newlyUnlocked.push(ach);
      }
    }
  }

  return {
    newlyUnlocked,
    allUnlockedIds: Array.from(allUnlockedIds),
  };
}

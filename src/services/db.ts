import Dexie, { type Table } from "dexie";
import type {
  Subject,
  Unit,
  Flashcard,
  ReviewLog,
  UserPreferences,
  AppTheme,
} from "../types";
export class FridaDatabase extends Dexie {
  subjects!: Table<Subject, string>;
  units!: Table<Unit, string>;
  cards!: Table<Flashcard, string>;
  reviewLogs!: Table<ReviewLog, string>;
  constructor() {
    super("FridaDatabase");
    this.version(1).stores({
      subjects: "id, name, createdAt",
      units: "id, subjectId, name, order, createdAt",
      cards: "id, subjectId, unitId, dueDate, state, createdAt",
      reviewLogs: "id, cardId, rating, timestamp",
    });
  }
}
export const db =
  new FridaDatabase(); /** * Seeds initial demo cards and sample subject if database is empty */
export async function seedDatabaseIfEmpty() {
  const subjectCount = await db.subjects.count();
  if (subjectCount > 0) return;
  const now = Date.now();
  const sampleSubjectId = "sub-demo-1";
  const sampleUnitId = "unit-demo-1";
  const sampleSubject: Subject = {
    id: sampleSubjectId,
    name: "Técnicas de Estudio & Memoria",
    description:
      "Aprende cómo funciona tu cerebro y la repetición espaciada mientras pruebas Frida.",
    color: "lavender",
    icon: "Sparkles",
    createdAt: now,
  };
  const sampleUnit: Unit = {
    id: sampleUnitId,
    subjectId: sampleSubjectId,
    name: "1. Fundamentos de la Memoria",
    description: "Efecto del espaciado, curva del olvido y recuerdo activo.",
    order: 1,
    createdAt: now,
  };
  const sampleCards: Flashcard[] = [
    {
      id: "card-demo-1",
      subjectId: sampleSubjectId,
      unitId: sampleUnitId,
      front: '¿Qué es el "Efecto del Espaciado" en el aprendizaje?',
      back: 'Es el principio que demuestra que consolidamos mucho mejor la información si la estudiamos espaciada en el tiempo, en lugar de repasarla toda junta en una noche ("cramming").',
      tags: ["memoria", "fundamentos"],
      createdAt: now,
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: now - 1000,
      state: "new",
    },
    {
      id: "card-demo-2",
      subjectId: sampleSubjectId,
      unitId: sampleUnitId,
      front: '¿Quién descubrió la "Curva del Olvido" y qué explica?',
      back: "Hermann Ebbinghaus (1885). Explica cómo perdemos información a un ritmo exponencial en los primeros días tras aprenderla si no la repasamos activamente.",
      tags: ["historia", "ebbinghaus"],
      createdAt: now,
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: now - 1000,
      state: "new",
    },
    {
      id: "card-demo-3",
      subjectId: sampleSubjectId,
      unitId: sampleUnitId,
      front:
        '¿Por qué el "Recuerdo Activo" (Active Recall) es más efectivo que subrayar o releer?',
      back: "Porque esforzar al cerebro a extraer información de la memoria fortalece los caminos neuronales, mientras que releer crea una falsa ilusión de dominio.",
      tags: ["tecnicas", "active-recall"],
      createdAt: now,
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: now - 1000,
      state: "new",
    },
    {
      id: "card-demo-4",
      subjectId: sampleSubjectId,
      unitId: sampleUnitId,
      front: "¿Cómo decide Frida cuándo volver a mostrarte una tarjeta?",
      back: 'Usa el algoritmo SM-2: con 4 opciones precisas (Otra vez, Difícil, Bien y Fácil), Frida ajusta el momento exacto para volver a repasar la tarjeta y fijarla en tu memoria.',
      tags: ["algoritmo", "sm-2"],
      createdAt: now,
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: now - 1000,
      state: "new",
    },
  ];
  await db.transaction("rw", db.subjects, db.units, db.cards, async () => {
    await db.subjects.add(sampleSubject);
    await db.units.add(sampleUnit);
    await db.cards.bulkAdd(sampleCards);
  });
} // User preferences management via localStorage
const PREFS_KEY = "frida_user_preferences";
export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const theme: AppTheme =
        parsed.theme === "windows-95" || parsed.theme === "windows-vista"
          ? "windows-95"
          : "original";
      return {
        dailyGoal: 20,
        soundEnabled: true,
        buttonSoundEnabled: true,
        clickSoundStyle: "keyboard-thock",
        hasSeenTutorial: false,
        userName: "Estudiante",
        userAvatar: "",
        userBio: "Construyendo mi conocimiento tarjeta a tarjeta 🐾",
        joinedDate: Date.now(),
        unlockedAchievementIds: [],
        ...parsed,
        theme,
      };
    }
  } catch (e) {
    console.error("Failed to read preferences", e);
  }
  return {
    dailyGoal: 20,
    soundEnabled: true,
    buttonSoundEnabled: true,
    clickSoundStyle: "keyboard-thock",
    hasSeenTutorial: false,
    userName: "Estudiante",
    userAvatar: "",
    userBio: "Construyendo mi conocimiento tarjeta a tarjeta 🐾",
    joinedDate: Date.now(),
    unlockedAchievementIds: [],
    theme: "original",
  };
}
export function saveUserPreferences(
  prefs: Partial<UserPreferences>,
): UserPreferences {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  return updated;
}

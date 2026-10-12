export interface DynamicGreeting {
  salutation: string;
  subheading: string;
  timeContext: "morning" | "afternoon" | "night";
}

const MORNING_SUBHEADINGS = [
  "Empecemos el día con ventaja: unos minutos de repaso marcan la diferencia.",
  "¿Qué tema quieres dominar esta mañana?",
  "Tu memoria está fresca. Ideal para consolidar conceptos nuevos.",
  "Un café, tus tarjetas y Frida: la mejor fórmula para aprender sin estrés.",
];

const AFTERNOON_SUBHEADINGS = [
  "Excelente momento para una pausa productiva y reforzar tus materias.",
  "Frida tiene listas tus tarjetas de hoy. ¿Listo para darles un repaso?",
  "Cada tarjeta calificada hoy es un concepto fijado a largo plazo.",
  "Mantengamos el impulso. ¿Con qué materia seguimos?",
];

const NIGHT_SUBHEADINGS = [
  "Repasar antes de dormir ayuda a que tu cerebro consolide la memoria durante la noche.",
  "Un repaso suave para cerrar el día con la meta cumplida.",
  "Gran constancia. Unos minutos más y descansamos con la mente tranquila.",
  "El algoritmo de espaciado se encargará del resto mientras descansas.",
];

const GENERAL_SUBHEADINGS = [
  "El recuerdo activo supera a horas de relectura pasiva.",
  "Construyendo conocimiento duradero, tarjeta a tarjeta.",
  "La consistencia vence al talento cuando el talento no es consistente.",
  "Tus metas académicas están a solo unas sesiones de distancia.",
];

/**
 * Returns a personalized Gemini-style greeting according to the current hour and user name.
 */
export function getDynamicGreeting(userName = "Estudiante", seed = 0): DynamicGreeting {
  const hour = new Date().getHours();
  const cleanName = userName?.trim() ? userName.trim() : "Estudiante";

  let salutation = "";
  let subheadingsPool: string[] = [];
  let timeContext: "morning" | "afternoon" | "night" = "afternoon";

  if (hour >= 5 && hour < 12) {
    salutation = `¡Buenos días, ${cleanName}!`;
    subheadingsPool = MORNING_SUBHEADINGS;
    timeContext = "morning";
  } else if (hour >= 12 && hour < 19) {
    salutation = `¡Buenas tardes, ${cleanName}!`;
    subheadingsPool = AFTERNOON_SUBHEADINGS;
    timeContext = "afternoon";
  } else {
    salutation = `¡Buenas noches, ${cleanName}!`;
    subheadingsPool = NIGHT_SUBHEADINGS;
    timeContext = "night";
  }

  // Combine with general pool
  const allPool = [...subheadingsPool, ...GENERAL_SUBHEADINGS];
  const index = Math.abs(seed) % allPool.length;
  const subheading = allPool[index];

  return {
    salutation,
    subheading,
    timeContext,
  };
}

/**
 * Calculates student tier/title based on cards reviewed and streak
 */
export function calculateStudentRank(totalReviewed: number, currentStreak: number): {
  title: string;
  level: number;
  badge: string;
  color: string;
  nextTierTarget: number;
  progressPercent: number;
} {
  const score = totalReviewed + currentStreak * 5;

  if (score >= 1000) {
    return {
      title: "Leyenda de Frida",
      level: 5,
      badge: "👑",
      color: "from-amber-500 to-yellow-400",
      nextTierTarget: 1000,
      progressPercent: 100,
    };
  } else if (score >= 400) {
    const progress = Math.min(100, Math.round(((score - 400) / 600) * 100));
    return {
      title: "Maestro del Recuerdo",
      level: 4,
      badge: "🏆",
      color: "from-purple-600 to-indigo-500",
      nextTierTarget: 1000,
      progressPercent: progress,
    };
  } else if (score >= 150) {
    const progress = Math.min(100, Math.round(((score - 150) / 250) * 100));
    return {
      title: "Mente Brillante",
      level: 3,
      badge: "🧠",
      color: "from-indigo-600 to-sky-500",
      nextTierTarget: 400,
      progressPercent: progress,
    };
  } else if (score >= 30) {
    const progress = Math.min(100, Math.round(((score - 30) / 120) * 100));
    return {
      title: "Estudiante Constante",
      level: 2,
      badge: "⚡",
      color: "from-emerald-500 to-teal-400",
      nextTierTarget: 150,
      progressPercent: progress,
    };
  } else {
    const progress = Math.min(100, Math.round((score / 30) * 100));
    return {
      title: "Principiante Curioso",
      level: 1,
      badge: "🌱",
      color: "from-purple-500 to-pink-500",
      nextTierTarget: 30,
      progressPercent: progress,
    };
  }
}

import React, { useState } from "react";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { UserPreferences, Subject, Flashcard, ReviewLog } from "../types";
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  type Achievement,
} from "../services/achievements";
import { playAchievementSound } from "../services/audio";

interface AchievementTreeProps {
  preferences: UserPreferences;
  subjects: Subject[];
  cards: Flashcard[];
  reviewLogs: ReviewLog[];
  currentStreak: number;
  onTriggerTestAchievement?: () => void;
}

const BRANCH_META: Record<
  string,
  { title: string; icon: string; description: string; color: string }
> = {
  memory: {
    title: "El Camino del Recuerdo",
    icon: "🧠",
    description: "Repasa tarjetas y domina la curva del olvido.",
    color: "from-purple-500 to-indigo-600",
  },
  streak: {
    title: "La Llama del Hábito",
    icon: "🔥",
    description: "Mantén viva tu racha estudiando todos los días.",
    color: "from-amber-500 to-rose-500",
  },
  creator: {
    title: "El Gran Creador",
    icon: "📚",
    description: "Construye tu propio santuario de conocimientos.",
    color: "from-emerald-500 to-teal-600",
  },
  mastery: {
    title: "Maestría con Frida",
    icon: "🐾",
    description: "Personaliza tu estudio y supera desafíos especiales.",
    color: "from-pink-500 to-purple-600",
  },
};

export const AchievementTree: React.FC<AchievementTreeProps> = ({
  preferences,
  subjects,
  cards,
  reviewLogs,
  currentStreak,
  onTriggerTestAchievement,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [inspectedAchievement, setInspectedAchievement] = useState<Achievement>(
    ACHIEVEMENTS[0]
  );

  // Evaluate unlocked status against real stats
  const { allUnlockedIds } = evaluateAchievements(
    preferences,
    subjects,
    cards,
    reviewLogs,
    currentStreak
  );
  const unlockedSet = new Set(allUnlockedIds);

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;
  const overallProgress = Math.round((unlockedCount / totalAchievements) * 100);

  const branchesKeys = ["memory", "streak", "creator", "mastery"];
  const visibleBranches =
    selectedBranch === "all"
      ? branchesKeys
      : branchesKeys.filter((b) => b === selectedBranch);

  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-700 shadow-2xl relative overflow-hidden text-white space-y-6">
      {/* Subtle grid pattern background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#a855f7 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      {/* Tree Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-400/20">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-amber-400 tracking-wide uppercase">
                Árbol de Logros
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Estilo Minecraft
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Desbloquea niveles secuenciales para avanzar en cada rama de conocimiento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block">Progreso Total</span>
            <span className="text-base font-black text-white">
              {unlockedCount} / {totalAchievements}{" "}
              <span className="text-xs text-amber-400 font-bold">({overallProgress}%)</span>
            </span>
          </div>
          {onTriggerTestAchievement && (
            <button
              type="button"
              onClick={onTriggerTestAchievement}
              className="px-3 py-2 rounded-xl bg-purple-600/60 hover:bg-purple-600 text-white text-xs font-bold border border-purple-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Probar animación y sonido"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Probar Notificación</span>
            </button>
          )}
        </div>
      </div>

      {/* Branch Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none relative z-10">
        <button
          type="button"
          onClick={() => setSelectedBranch("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedBranch === "all"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black scale-102"
              : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700"
          }`}
        >
          🌟 Todas las Ramas
        </button>
        {branchesKeys.map((key) => {
          const b = BRANCH_META[key];
          const isSelected = selectedBranch === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedBranch(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black scale-102"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700"
              }`}
            >
              <span>{b.icon}</span>
              <span>{b.title}</span>
            </button>
          );
        })}
      </div>

      {/* Branch Trees Visual Canvas */}
      <div className="space-y-6 relative z-10">
        {visibleBranches.map((branchKey) => {
          const meta = BRANCH_META[branchKey];
          const branchAchievements = ACHIEVEMENTS.filter((a) => a.branch === branchKey).sort(
            (a, b) => a.level - b.level
          );

          return (
            <div
              key={branchKey}
              className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 relative overflow-hidden"
            >
              {/* Branch Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-200">
                      {meta.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{meta.description}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {branchAchievements.filter((a) => unlockedSet.has(a.id)).length} /{" "}
                  {branchAchievements.length}
                </span>
              </div>

              {/* Nodes Progression Path (Minecraft-style connectors) */}
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-2 overflow-x-auto py-2">
                {branchAchievements.map((ach, index) => {
                  const isUnlocked = unlockedSet.has(ach.id);
                  const isParentUnlocked = !ach.parentId || unlockedSet.has(ach.parentId);
                  const isSelected = inspectedAchievement?.id === ach.id;

                  return (
                    <React.Fragment key={ach.id}>
                      {/* Connecting Line from previous node */}
                      {index > 0 && (
                        <div className="hidden sm:flex items-center justify-center shrink-0 w-8">
                          <div
                            className={`h-1 w-full rounded-full transition-all duration-300 ${
                              isUnlocked
                                ? "bg-amber-400 shadow-xs shadow-amber-400"
                                : isParentUnlocked
                                ? "bg-slate-700 border-t border-dashed border-slate-500"
                                : "bg-slate-800"
                            }`}
                          />
                        </div>
                      )}

                      {/* Achievement Node Item */}
                      <div
                        onClick={() => setInspectedAchievement(ach)}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all duration-200 shrink-0 w-full sm:w-36 ${
                          isSelected
                            ? "bg-slate-800/90 ring-2 ring-amber-400 scale-102"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        {/* Minecraft Frame Icon */}
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all relative ${
                            isUnlocked
                              ? ach.type === "challenge"
                                ? "bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-amber-300 text-white shadow-lg shadow-amber-500/40 scale-105"
                                : ach.type === "goal"
                                ? "bg-gradient-to-tr from-purple-600 to-indigo-500 border-2 border-purple-300 text-white shadow-lg shadow-purple-500/30"
                                : "bg-gradient-to-tr from-indigo-700 to-slate-700 border-2 border-indigo-400 text-white shadow-md shadow-indigo-500/20"
                              : isParentUnlocked
                              ? "bg-slate-800 border-2 border-slate-600 text-slate-400 hover:border-slate-400"
                              : "bg-slate-900 border border-slate-800 text-slate-600 opacity-60"
                          }`}
                        >
                          <span>{ach.icon}</span>

                          {/* Status corner badge */}
                          {isUnlocked ? (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          ) : !isParentUnlocked ? (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center border border-slate-700">
                              <Lock className="w-3 h-3" />
                            </div>
                          ) : null}

                          {/* Challenge crown banner */}
                          {ach.type === "challenge" && (
                            <div className="absolute -bottom-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full uppercase tracking-tighter shadow-xs">
                              Desafío
                            </div>
                          )}
                        </div>

                        {/* Node Title & Level */}
                        <div className="text-center mt-2.5 max-w-[120px]">
                          <span className="text-[10px] font-extrabold uppercase text-amber-400/90 tracking-wider block">
                            Nivel {ach.level}
                          </span>
                          <h5
                            className={`text-xs font-bold truncate leading-tight mt-0.5 ${
                              isUnlocked
                                ? "text-white"
                                : isParentUnlocked
                                ? "text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            {ach.title}
                          </h5>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Achievement Detail Inspection Card */}
      {inspectedAchievement && (
        <div className="bg-slate-950 border-2 border-amber-400/40 rounded-2xl p-5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 ${
                unlockedSet.has(inspectedAchievement.id)
                  ? "bg-gradient-to-tr from-amber-500 to-yellow-400 border-amber-300 text-white shadow-lg shadow-amber-400/25"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              <span>{inspectedAchievement.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  {inspectedAchievement.branchTitle} • Nivel {inspectedAchievement.level}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inspectedAchievement.type === "challenge"
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                      : inspectedAchievement.type === "goal"
                      ? "bg-purple-400/20 text-purple-300 border border-purple-400/40"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {inspectedAchievement.type === "challenge"
                    ? "Desafío Épico"
                    : inspectedAchievement.type === "goal"
                    ? "Meta Mayor"
                    : "Tarea Normal"}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">
                {inspectedAchievement.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {inspectedAchievement.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => playAchievementSound(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Escuchar fanfarria"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Sonido Épico</span>
            </button>

            <div
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 ${
                unlockedSet.has(inspectedAchievement.id)
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {unlockedSet.has(inspectedAchievement.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡Desbloqueado!</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Bloqueado</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Flame, CheckCircle, ArrowRight, RotateCcw } from "lucide-react";
import type { Flashcard, ReviewRating } from "../types";
import { playCelebrationFanfare } from "../services/audio";
import { FridaMascot } from "./FridaMascot";

interface SessionSummaryProps {
  reviewedLogs: { card: Flashcard; rating: ReviewRating }[];
  currentStreak: number;
  reviewedTodayCount: number;
  dailyGoal: number;
  isCramMode?: boolean;
  onClose: () => void;
  onStudyAgain?: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  reviewedLogs,
  currentStreak,
  reviewedTodayCount,
  dailyGoal,
  isCramMode = false,
  onClose,
  onStudyAgain,
}) => {
  useEffect(() => {
    playCelebrationFanfare();
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: isCramMode
          ? ["#FB7185", "#F43F5E", "#FDA4AF", "#A78BFA", "#FBBF24"]
          : ["#A78BFA", "#C4B5FD", "#818CF8", "#F472B6", "#34D399"],
      });
    } catch (e) {
      // ignore
    }
  }, [isCramMode]);

  const countByRating = {
    1: reviewedLogs.filter((l) => l.rating === 1).length,
    2: reviewedLogs.filter((l) => l.rating === 2).length,
    3: reviewedLogs.filter((l) => l.rating === 3).length,
    4: reviewedLogs.filter((l) => l.rating === 4).length,
  };

  const isGoalReached = reviewedTodayCount >= dailyGoal;

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9FD]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className={`bg-white border rounded-3xl max-w-lg w-full p-8 text-center space-y-6 animate-in zoom-in-95 duration-300 shadow-2xl ${
          isCramMode ? "border-rose-200" : "border-purple-100"
        }`}
      >
        {/* Celebrating Frida Mascot */}
        <div
          className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto p-2 ${
            isCramMode ? "bg-rose-50" : "bg-purple-50"
          }`}
        >
          <FridaMascot mood="celebrating" size={80} interactive />
        </div>
        <div>
          {isCramMode ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2 border border-rose-200">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Modo Intensivo Finalizado</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800">
                ¡Gran repaso para tu examen! 🐾🔥
              </h2>
              <p className="text-sm opacity-70 mt-1 text-slate-600">
                Entrenaste tus conceptos a fondo. Tus fechas de repaso espaciado a largo plazo se mantienen intactas.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black tracking-tight text-slate-800">
                ¡Excelente sesión con Frida! 🐾🎉
              </h2>
              <p className="text-sm opacity-70 mt-1 text-slate-600">
                Cada repaso refuerza tus conexiones neuronales y consolida tu memoria.
              </p>
            </>
          )}
        </div>
        {/* Highlight Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-purple-50/60 shadow-sm border border-purple-100">
            <span className="text-xs font-semibold text-purple-700 block mb-1">
              {" "}
              Repasadas ahora{" "}
            </span>
            <span className="text-2xl font-black text-purple-950">
              {" "}
              {reviewedLogs.length}{" "}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 shadow-sm border border-amber-100">
            <span className="text-xs font-semibold text-amber-700 block mb-1 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Racha activa</span>
            </span>
            <span className="text-2xl font-black text-amber-950">
              {" "}
              {currentStreak} {currentStreak === 1 ? "día" : "días"}{" "}
            </span>
          </div>
        </div>
        {/* Anki 4 Rating Breakdown */}
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-left">
          <span className="text-xs font-bold opacity-75 block mb-2.5">
            Tus respuestas:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-rose-50/80 text-rose-800 font-medium border border-rose-200/60">
              <span className="block text-[11px] text-rose-600 font-semibold">Otra vez</span>
              <span className="text-base font-black">{countByRating[1]}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/80 text-amber-800 font-medium border border-amber-200/60">
              <span className="block text-[11px] text-amber-600 font-semibold">Difícil</span>
              <span className="text-base font-black">{countByRating[2]}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/80 text-emerald-900 font-medium border border-emerald-200/60">
              <span className="block text-[11px] text-emerald-700 font-semibold">Bien</span>
              <span className="text-base font-black">{countByRating[3]}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50/80 text-sky-900 font-medium border border-sky-200/60">
              <span className="block text-[11px] text-sky-700 font-semibold">Fácil</span>
              <span className="text-base font-black">{countByRating[4]}</span>
            </div>
          </div>
        </div>
        {/* Daily Goal Encouragement */}
        <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 text-xs opacity-80 flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            {" "}
            {isGoalReached
              ? "🎉 ¡Completaste tu meta diaria de hoy!"
              : `Has estudiado ${reviewedTodayCount} de tu meta de ${dailyGoal} tarjetas hoy.`}{" "}
          </span>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onStudyAgain && (
            <button
              onClick={onStudyAgain}
              className="flex-1 py-3 px-4 rounded-2xl bg-purple-50 text-purple-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-100"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repasar más</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-700 shadow-md"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

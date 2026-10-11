import React from "react";
import {
  Calendar,
  Sparkles,
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Book,
  Brain,
  Code2,
  Palette,
  Globe,
  HeartPulse,
  Flame,
} from "lucide-react";
import type { Subject, Flashcard } from "../types";
import { FridaMascot } from "./FridaMascot";

interface TodayReviewViewProps {
  subjects: Subject[];
  cards: Flashcard[];
  onStartGlobalStudy: () => void;
  onStartCramGlobal?: () => void;
  onStartStudySubject: (subjectId: string) => void;
  onStartCramSubject?: (subjectId: string) => void;
  onGoToSubjects: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Book,
  Brain,
  Sparkles,
  Code2,
  Palette,
  Globe,
  HeartPulse,
};

export const TodayReviewView: React.FC<TodayReviewViewProps> = ({
  subjects,
  cards,
  onStartGlobalStudy,
  onStartCramGlobal,
  onStartStudySubject,
  onStartCramSubject,
  onGoToSubjects,
}) => {
  const now = Date.now();
  const dueCards = cards.filter((c) => c.dueDate <= now);

  // Group by subjects
  const subjectsWithStats = subjects.map((sub) => {
    const subCards = cards.filter((c) => c.subjectId === sub.id);
    const subDueCards = subCards.filter((c) => c.dueDate <= now);
    return {
      subject: sub,
      totalCards: subCards.length,
      dueCards: subDueCards.length,
    };
  });

  const subjectsWithDue = subjectsWithStats.filter((item) => item.dueCards > 0);
  const subjectsUpToDate = subjectsWithStats.filter(
    (item) => item.dueCards === 0 && item.totalCards > 0
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
              Repaso de Hoy
            </h2>
            <p className="text-sm opacity-70 mt-0.5 text-slate-600">
              Revisión inteligente programada para consolidar tu memoria a largo plazo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {cards.length > 0 && onStartCramGlobal && (
            <button
              onClick={onStartCramGlobal}
              title="Repasa todas las tarjetas libremente para un examen sin alterar tus intervalos a largo plazo"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 shadow-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Modo Intensivo ({cards.length})</span>
            </button>
          )}

          {dueCards.length > 0 && (
            <button
              onClick={onStartGlobalStudy}
              className="glass-button-primary inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Estudiar todo ({dueCards.length})</span>
            </button>
          )}
        </div>
      </div>

      {dueCards.length > 0 ? (
        <>
          {/* Hero Summary Card */}
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="w-20 h-20 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 p-1">
                <FridaMascot mood="studying" size={68} />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sesión Diaria Recomendada</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  {dueCards.length} {dueCards.length === 1 ? "tarjeta pendiente" : "tarjetas pendientes"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Distribuidas en {subjectsWithDue.length}{" "}
                  {subjectsWithDue.length === 1 ? "materia" : "materias distintas"}.
                </p>
              </div>
            </div>

            <button
              onClick={onStartGlobalStudy}
              className="w-full md:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Empezar a estudiar ahora</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Breakdown By Subject */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Pendientes por materia</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Puedes repasar una materia en particular o todas juntas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectsWithDue.map(({ subject, dueCards: count, totalCards }) => {
                const IconComp = ICON_MAP[subject.icon] || Sparkles;
                return (
                  <div
                    key={subject.id}
                    className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs hover:border-purple-300 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 truncate">
                          {subject.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
                            {count} {count === 1 ? "tarjeta" : "tarjetas"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            de {totalCards} total
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onStartCramSubject && (
                        <button
                          onClick={() => onStartCramSubject(subject.id)}
                          title="Modo Intensivo para esta materia (repaso libre para examen)"
                          className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
                        >
                          <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        </button>
                      )}
                      <button
                        onClick={() => onStartStudySubject(subject.id)}
                        className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Repasar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subjects Up to date (if any) */}
          {subjectsUpToDate.length > 0 && (
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Materias al día hoy
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjectsUpToDate.map(({ subject, totalCards }) => {
                  const IconComp = ICON_MAP[subject.icon] || Sparkles;
                  return (
                    <div
                      key={subject.id}
                      className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between gap-3 text-slate-600"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold truncate text-slate-700 block">
                            {subject.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {totalCards} tarjetas
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Al día
                        </span>
                        {onStartCramSubject && (
                          <button
                            onClick={() => onStartCramSubject(subject.id)}
                            title="Modo Intensivo para esta materia (repaso libre para examen)"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
                          >
                            <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State: Absolutely no browser alert, friendly and peaceful */
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-purple-100 shadow-sm text-center max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-28 h-28 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto p-2">
            <FridaMascot mood="celebrating" size={96} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Todo repasado por hoy
            </span>
            <h3 className="text-2xl font-black text-slate-800">
              ¡Estás completamente al día!
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              No tienes ninguna tarjeta pendiente de repaso para hoy según el algoritmo de repetición espaciada. Tu memoria ya se encuentra consolidando lo aprendido.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/60 text-xs text-purple-900 leading-relaxed text-left max-w-md mx-auto">
            <p className="font-semibold mb-1">💡 ¿Qué puedes hacer ahora?</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Descansar y dejar que tu cerebro fije los recuerdos.</li>
              <li>Añadir nuevas tarjetas en tus materias.</li>
              <li>Activar el <strong>Modo Intensivo</strong> si tienes un examen cercano y quieres repasar todo libremente sin alterar tus fechas a largo plazo.</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={onGoToSubjects}
              className="px-6 py-3 rounded-2xl glass-button-primary font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ver Mis Materias</span>
            </button>

            {cards.length > 0 && onStartCramGlobal && (
              <button
                onClick={onStartCramGlobal}
                className="px-6 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs inline-flex items-center gap-2 shadow-xs hover:bg-rose-100 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Modo Intensivo ({cards.length} tarjetas)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

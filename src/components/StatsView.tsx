import React from "react";
import { Flame, Sparkles, BookOpen, Award, Target } from "lucide-react";
import type { Subject, Flashcard, ReviewLog, UserPreferences } from "../types";
import { FridaMascot } from "./FridaMascot";
interface StatsViewProps {
  subjects: Subject[];
  cards: Flashcard[];
  reviewLogs: ReviewLog[];
  currentStreak: number;
  reviewedTodayCount: number;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}
export const StatsView: React.FC<StatsViewProps> = ({
  subjects,
  cards,
  reviewLogs,
  currentStreak,
  reviewedTodayCount,
  preferences,
  onUpdatePreferences,
}) => {
  const newCards = cards.filter((c) => c.state === "new").length;
  const learningCards = cards.filter((c) => c.state === "learning").length;
  const reviewCards = cards.filter((c) => c.state === "review").length;
  const totalCards = cards.length || 1;
  const reviewPercent = Math.round((reviewCards / totalCards) * 100);
  const learningPercent = Math.round((learningCards / totalCards) * 100);
  const newPercent = Math.round((newCards / totalCards) * 100);
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {" "}
            Progreso y Memoria{" "}
          </h2>{" "}
          <p className="text-sm opacity-70 mt-1">
            {" "}
            Mira cómo evoluciona tu conocimiento y mantén el hábito diario{" "}
          </p>{" "}
        </div>{" "}
        <FridaMascot
          mood="studying"
          size={56}
          className="hidden sm:inline-flex"
        />{" "}
      </div>{" "}
      {/* Primary KPI Grid Liquid Glass */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {" "}
        {/* Streak */}{" "}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-amber-200/60">
          {" "}
          <div className="flex items-center justify-between mb-3">
            {" "}
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {" "}
              Racha{" "}
            </span>{" "}
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              {" "}
              <Flame className="w-4 h-4 fill-current" />{" "}
            </div>{" "}
          </div>{" "}
          <p className="text-3xl font-black text-amber-950">
            {" "}
            {currentStreak}{" "}
            <span className="text-sm font-semibold text-amber-700">
              {currentStreak === 1 ? "día" : "días"}
            </span>{" "}
          </p>{" "}
          <p className="text-[11px] text-amber-800/80 mt-1 font-medium">
            {" "}
            {currentStreak > 0
              ? "¡Excelente hábito!"
              : "Repasa hoy para activar tu racha."}{" "}
          </p>{" "}
        </div>{" "}
        {/* Reviewed Today */}{" "}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-purple-50/80 to-indigo-50/50 border-purple-200/60">
          {" "}
          <div className="flex items-center justify-between mb-3">
            {" "}
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              {" "}
              Repasadas hoy{" "}
            </span>{" "}
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              {" "}
              <Sparkles className="w-4 h-4" />{" "}
            </div>{" "}
          </div>{" "}
          <p className="text-3xl font-black text-purple-950">
            {" "}
            {reviewedTodayCount}{" "}
            <span className="text-sm font-semibold text-purple-600">
              tarjetas
            </span>{" "}
          </p>{" "}
          <p className="text-[11px] text-purple-700/80 mt-1 font-medium">
            {" "}
            Meta diaria: {preferences.dailyGoal} tarjetas{" "}
          </p>{" "}
        </div>{" "}
        {/* Total Cards */}{" "}
        <div className="glass-panel p-6 rounded-3xl">
          {" "}
          <div className="flex items-center justify-between mb-3">
            {" "}
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">
              {" "}
              Total tarjetas{" "}
            </span>{" "}
            <div className="p-2 rounded-xl glass-button">
              {" "}
              <BookOpen className="w-4 h-4" />{" "}
            </div>{" "}
          </div>{" "}
          <p className="text-3xl font-black"> {cards.length} </p>{" "}
          <p className="text-[11px] opacity-60 mt-1 font-medium">
            {" "}
            En {subjects.length} materias{" "}
          </p>{" "}
        </div>{" "}
        {/* Total Reviews Logged */}{" "}
        <div className="glass-panel p-6 rounded-3xl">
          {" "}
          <div className="flex items-center justify-between mb-3">
            {" "}
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">
              {" "}
              Repasos hechos{" "}
            </span>{" "}
            <div className="p-2 rounded-xl glass-button">
              {" "}
              <Award className="w-4 h-4" />{" "}
            </div>{" "}
          </div>{" "}
          <p className="text-3xl font-black"> {reviewLogs.length} </p>{" "}
          <p className="text-[11px] opacity-60 mt-1 font-medium">
            {" "}
            Respuestas registradas{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Memory Status Breakdown */}{" "}
      <div className="glass-panel p-7 rounded-3xl space-y-6">
        {" "}
        <div>
          {" "}
          <h3 className="text-lg font-bold">
            {" "}
            Distribución del Aprendizaje{" "}
          </h3>{" "}
          <p className="text-xs opacity-70">
            {" "}
            Nivel de consolidación de tus tarjetas en la memoria{" "}
          </p>{" "}
        </div>{" "}
        {/* Progress bar */}{" "}
        <div className="w-full h-3.5 rounded-full bg-slate-200/60 overflow-hidden flex shadow-inner">
          {" "}
          <div
            className="bg-purple-600 transition-all duration-500"
            style={{ width: `${reviewPercent}%` }}
            title={`Consolidadas: ${reviewCards}`}
          />{" "}
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${learningPercent}%` }}
            title={`En aprendizaje: ${learningCards}`}
          />{" "}
          <div
            className="bg-slate-300 transition-all duration-500"
            style={{ width: `${newPercent}%` }}
            title={`Nuevas: ${newCards}`}
          />{" "}
        </div>{" "}
        {/* Legend */}{" "}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {" "}
          <div className="p-4 rounded-2xl glass-panel bg-purple-50/50 border-purple-200/50">
            {" "}
            <div className="flex items-center gap-2 mb-1">
              {" "}
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />{" "}
              <span className="text-xs font-bold text-purple-900">
                {" "}
                Consolidadas ({reviewPercent}%){" "}
              </span>{" "}
            </div>{" "}
            <p className="text-xl font-black text-purple-950">{reviewCards}</p>{" "}
            <p className="text-[11px] opacity-70 mt-1">
              {" "}
              Repasadas exitosamente con intervalos crecientes.{" "}
            </p>{" "}
          </div>{" "}
          <div className="p-4 rounded-2xl glass-panel bg-amber-50/50 border-amber-200/50">
            {" "}
            <div className="flex items-center gap-2 mb-1">
              {" "}
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{" "}
              <span className="text-xs font-bold text-amber-900">
                {" "}
                En aprendizaje ({learningPercent}%){" "}
              </span>{" "}
            </div>{" "}
            <p className="text-xl font-black text-amber-950">{learningCards}</p>{" "}
            <p className="text-[11px] opacity-70 mt-1">
              {" "}
              Tarjetas que te costaron recientemente.{" "}
            </p>{" "}
          </div>{" "}
          <div className="p-4 rounded-2xl glass-panel">
            {" "}
            <div className="flex items-center gap-2 mb-1">
              {" "}
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />{" "}
              <span className="text-xs font-bold opacity-80">
                {" "}
                Nuevas ({newPercent}%){" "}
              </span>{" "}
            </div>{" "}
            <p className="text-xl font-black">{newCards}</p>{" "}
            <p className="text-[11px] opacity-70 mt-1">
              {" "}
              Creadas recientemente pendientes de primer repaso.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Daily Goal Settings */}{" "}
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h4 className="text-base font-bold flex items-center gap-2">
            {" "}
            <Target className="w-4 h-4 text-purple-600" />{" "}
            <span>Meta Diaria</span>{" "}
          </h4>{" "}
          <p className="text-xs opacity-70 mt-0.5">
            {" "}
            Ajusta tu objetivo de tarjetas diarias{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-2">
          {" "}
          {[10, 20, 30, 50].map((goal) => (
            <button
              key={goal}
              onClick={() => onUpdatePreferences({ dailyGoal: goal })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${preferences.dailyGoal === goal ? "glass-button-primary" : "glass-button"}`}
            >
              {" "}
              {goal} / día{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

import React from "react";
import {
  BookOpen,
  Flame,
  HelpCircle,
  Plus,
  BarChart3,
  Calendar,
  Settings,
  User,
} from "lucide-react";
import type { Subject, Flashcard } from "../types";
import { FridaMascot } from "./FridaMascot";

interface SidebarProps {
  subjects: Subject[];
  cards: Flashcard[];
  activeView: "subjects" | "global-study" | "stats" | "profile" | "settings";
  selectedSubjectId: string | null;
  onSelectView: (
    view: "subjects" | "global-study" | "stats" | "profile" | "settings"
  ) => void;
  onSelectSubject: (subjectId: string) => void;
  onOpenNewSubject: () => void;
  onOpenTutorial: () => void;
  currentStreak: number;
  reviewedTodayCount: number;
  dailyGoal: number;
  userName?: string;
  userAvatar?: string;
}
export const Sidebar: React.FC<SidebarProps> = ({
  subjects,
  cards,
  activeView,
  selectedSubjectId,
  onSelectView,
  onSelectSubject,
  onOpenNewSubject,
  onOpenTutorial,
  currentStreak,
  reviewedTodayCount,
  dailyGoal,
  userName,
  userAvatar,
}) => {
  const now = Date.now();
  const totalDueCards = cards.filter((c) => c.dueDate <= now).length;
  const goalProgress = Math.min(
    100,
    Math.round((reviewedTodayCount / dailyGoal) * 100),
  );
  return (
    <aside className="w-72 bg-white shadow-sm border-r border-purple-100 flex flex-col h-screen select-none shrink-0 transition-all z-20">
      {" "}
      {/* Brand Header with Frida Mascot */}{" "}
      <div className="p-5 border-b border-purple-50 flex items-center justify-between">
        {" "}
        <div className="flex items-center gap-3">
          {" "}
          <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center p-0.5">
            {" "}
            <FridaMascot mood="happy" size={38} />{" "}
          </div>{" "}
          <div>
            {" "}
            <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5 text-slate-800">
              {" "}
              Frida{" "}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {" "}
                Flashcards{" "}
              </span>{" "}
            </h1>{" "}
            <p className="text-[11px] text-slate-500 font-medium">
              Estudio inteligente
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Daily Progress Mini-Dashboard */}{" "}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
        {" "}
        <div className="flex items-center justify-between mb-2">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <div
              className={`p-1.5 rounded-xl ${currentStreak > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-400"}`}
            >
              {" "}
              <Flame className="w-4 h-4 fill-current" />{" "}
            </div>{" "}
            <div>
              {" "}
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                Racha
              </span>{" "}
              <span className="text-sm font-black text-slate-800">
                {" "}
                {currentStreak} {currentStreak === 1 ? "día" : "días"}{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <span className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg text-purple-700 shadow-sm">
            {" "}
            {reviewedTodayCount}/{dailyGoal} hoy{" "}
          </span>{" "}
        </div>{" "}
        {/* Progress bar */}{" "}
        <div className="w-full bg-white h-2 rounded-full overflow-hidden mt-1.5 border border-purple-100">
          {" "}
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />{" "}
        </div>{" "}
        <p className="text-[11px] text-slate-500 mt-1.5 text-right font-medium">
          {" "}
          {goalProgress >= 100
            ? "🎉 ¡Meta cumplida hoy!"
            : `Faltan ${Math.max(0, dailyGoal - reviewedTodayCount)} tarjetas`}{" "}
        </p>{" "}
      </div>{" "}
      {/* Navigation Links */}{" "}
      <div className="px-3 py-1 space-y-1">
        {" "}
        <button
          onClick={() => {
            onSelectView("subjects");
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${activeView === "subjects" && !selectedSubjectId ? "bg-purple-100 text-purple-900 font-bold" : "text-slate-600 hover:bg-purple-50/50"}`}
        >
          {" "}
          <div className="flex items-center gap-2.5">
            {" "}
            <BookOpen className="w-4 h-4 text-purple-600" />{" "}
            <span>Mis Materias</span>{" "}
          </div>{" "}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-purple-100/70 text-purple-700">
            {" "}
            {subjects.length}{" "}
          </span>{" "}
        </button>{" "}
        <button
          onClick={() => {
            onSelectView("global-study");
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${activeView === "global-study" ? "bg-purple-100 text-purple-900 font-bold" : "text-slate-600 hover:bg-purple-50/50"}`}
        >
          {" "}
          <div className="flex items-center gap-2.5">
            {" "}
            <Calendar className="w-4 h-4 text-indigo-500" />{" "}
            <span>Repaso de Hoy</span>{" "}
          </div>{" "}
          {totalDueCards > 0 ? (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-600 text-white animate-pulse">
              {" "}
              {totalDueCards}{" "}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Al día</span>
          )}{" "}
        </button>{" "}
        <button
          onClick={() => {
            onSelectView("stats");
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${activeView === "stats" ? "bg-purple-100 text-purple-900 font-bold" : "text-slate-600 hover:bg-purple-50/50"}`}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Progreso</span>
          </div>
        </button>
        <button
          onClick={() => {
            onSelectView("profile");
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${activeView === "profile" ? "bg-purple-100 text-purple-900 font-bold" : "text-slate-600 hover:bg-purple-50/50"}`}
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-purple-600" />
            <span>Mi Perfil</span>
          </div>
        </button>
      </div>{" "}
      {/* Subjects Sub-list */}{" "}
      <div className="flex-1 overflow-y-auto px-3 py-2 mt-2">
        {" "}
        <div className="flex items-center justify-between px-2 mb-2">
          {" "}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {" "}
            Materias{" "}
          </span>{" "}
          <button
            onClick={onOpenNewSubject}
            title="Crear nueva materia"
            className="p-1 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
          >
            {" "}
            <Plus className="w-3.5 h-3.5" />{" "}
          </button>{" "}
        </div>{" "}
        <div className="space-y-1">
          {" "}
          {subjects.map((sub) => {
            const subCards = cards.filter((c) => c.subjectId === sub.id);
            const dueCount = subCards.filter((c) => c.dueDate <= now);
            const isSelected =
              selectedSubjectId === sub.id && activeView === "subjects";
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${isSelected ? "bg-purple-50 text-purple-950 font-bold border border-purple-100" : "text-slate-600 hover:bg-purple-50/40"}`}
              >
                {" "}
                <div className="flex items-center gap-2 truncate pr-2">
                  {" "}
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />{" "}
                  <span className="truncate">{sub.name}</span>{" "}
                </div>{" "}
                {dueCount.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-800 shrink-0">
                    {" "}
                    {dueCount.length}{" "}
                  </span>
                )}{" "}
              </button>
            );
          })}{" "}
          {subjects.length === 0 && (
            <p className="text-xs text-slate-400 italic px-2 py-1">
              {" "}
              Sin materias aún.{" "}
            </p>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* User Profile Mini Bar */}
      <div className="px-3 pt-2 pb-1 border-t border-purple-50">
        <button
          onClick={() => onSelectView("profile")}
          className={`w-full flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-pointer text-left ${
            activeView === "profile"
              ? "bg-purple-100 text-purple-950 font-bold border border-purple-200 shadow-xs"
              : "hover:bg-purple-50/60"
          }`}
          title="Ver y editar mi perfil"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden shrink-0 border border-purple-200">
            {userAvatar?.startsWith("data:image") ? (
              <img
                src={userAvatar}
                alt={userName || "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : userAvatar === "avatar:frida" ? (
              <FridaMascot mood="happy" size={24} />
            ) : userAvatar?.startsWith("avatar:") ? (
              <span className="text-sm">
                {userAvatar === "avatar:fox"
                  ? "🦊"
                  : userAvatar === "avatar:cat"
                  ? "🐱"
                  : userAvatar === "avatar:grad"
                  ? "🎓"
                  : userAvatar === "avatar:owl"
                  ? "🦉"
                  : userAvatar === "avatar:rocket"
                  ? "🚀"
                  : userAvatar === "avatar:lightning"
                  ? "⚡"
                  : "🌸"}
              </span>
            ) : (
              <span className="font-extrabold text-xs text-purple-700">
                {(userName || "E").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
              {userName || "Estudiante"}
            </span>
            <span className="text-[10px] text-purple-600 font-medium block truncate">
              Mi Perfil
            </span>
          </div>
        </button>
      </div>

      {/* Footer / Tutorial / Settings */}
      <div className="p-3 pt-1 space-y-1">
        {" "}
        <button
          onClick={() => onSelectView("settings")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeView === "settings" ? "bg-purple-100 text-purple-900 font-bold" : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"}`}
        >
          {" "}
          <div className="flex items-center gap-2.5">
            {" "}
            <Settings className="w-4 h-4 text-purple-500" />{" "}
            <span>Configuración</span>{" "}
          </div>{" "}
        </button>{" "}
        <button
          onClick={onOpenTutorial}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
        >
          {" "}
          <HelpCircle className="w-4 h-4 text-purple-500" />{" "}
          <span>¿Cómo funciona Frida?</span>{" "}
        </button>{" "}
      </div>{" "}
    </aside>
  );
};

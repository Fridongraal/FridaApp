import React, { useState, useRef } from "react";
import {
  User,
  Camera,
  Flame,
  CheckCircle2,
  Calendar,
  BookOpen,
  Layers,
  Save,
  Lock,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { UserPreferences, Subject, Flashcard, ReviewLog } from "../types";
import { FridaMascot } from "./FridaMascot";
import { compressImageToDataUrl } from "../services/imageUtils";
import { calculateStudentRank } from "../services/greetings";
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  type Achievement,
} from "../services/achievements";
import { playAchievementSound } from "../services/audio";

interface ProfileViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  subjects: Subject[];
  cards: Flashcard[];
  reviewLogs: ReviewLog[];
  currentStreak: number;
  onTriggerTestAchievement?: () => void;
}

const PRESET_AVATARS = [
  { id: "avatar:frida", label: "Frida", emoji: "🐾" },
  { id: "avatar:fox", label: "Zorro Astuto", emoji: "🦊" },
  { id: "avatar:cat", label: "Michi", emoji: "🐱" },
  { id: "avatar:grad", label: "Graduado", emoji: "🎓" },
  { id: "avatar:owl", label: "Búho Sabio", emoji: "🦉" },
  { id: "avatar:rocket", label: "Explorador", emoji: "🚀" },
  { id: "avatar:lightning", label: "Rayo", emoji: "⚡" },
  { id: "avatar:sakura", label: "Sakura", emoji: "🌸" },
];

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

export const ProfileView: React.FC<ProfileViewProps> = ({
  preferences,
  onUpdatePreferences,
  subjects,
  cards,
  reviewLogs,
  currentStreak,
  onTriggerTestAchievement,
}) => {
  const [nameInput, setNameInput] = useState(preferences.userName || "Estudiante");
  const [bioInput, setBioInput] = useState(
    preferences.userBio || "Construyendo mi conocimiento tarjeta a tarjeta 🐾"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [inspectedAchievement, setInspectedAchievement] = useState<Achievement>(
    ACHIEVEMENTS[0]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalReviewsCount = reviewLogs.length;
  const rank = calculateStudentRank(totalReviewsCount, currentStreak);

  // Evaluate unlocked status against real stats
  const { allUnlockedIds } = evaluateAchievements(
    preferences,
    subjects,
    cards,
    reviewLogs,
    currentStreak
  );
  const unlockedSet = new Set(allUnlockedIds);

  const joinedFormatted = preferences.joinedDate
    ? new Intl.DateTimeFormat("es-ES", {
        month: "long",
        year: "numeric",
      }).format(new Date(preferences.joinedDate))
    : "Reciente";

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = nameInput.trim() || "Estudiante";
    const cleanBio = bioInput.trim();
    onUpdatePreferences({
      userName: cleanName,
      userBio: cleanBio,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 256, 256, 0.88);
      onUpdatePreferences({ userAvatar: compressedDataUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Error al procesar la foto de perfil", err);
      alert("No se pudo cargar la imagen seleccionada.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectPreset = (avatarId: string) => {
    onUpdatePreferences({ userAvatar: avatarId });
  };

  const handleRemovePhoto = () => {
    onUpdatePreferences({ userAvatar: "" });
  };

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;
  const overallProgress = Math.round((unlockedCount / totalAchievements) * 100);

  // Filter branches
  const branchesKeys = ["memory", "streak", "creator", "mastery"];
  const visibleBranches =
    selectedBranch === "all"
      ? branchesKeys
      : branchesKeys.filter((b) => b === selectedBranch);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
            Mi Perfil de Estudiante
          </h2>
          <p className="text-sm opacity-70 mt-1 text-slate-500">
            Personaliza tu identidad y desbloquea el árbol de logros de Frida
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Perfil actualizado con éxito!</span>
          </div>
        )}
      </div>

      {/* Main Profile Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-br from-purple-200/40 via-indigo-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-br from-purple-500 via-indigo-400 to-purple-600 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-white overflow-hidden flex items-center justify-center relative">
                  {preferences.userAvatar?.startsWith("data:image") ? (
                    <img
                      src={preferences.userAvatar}
                      alt={preferences.userName || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : preferences.userAvatar === "avatar:frida" ? (
                    <div className="w-full h-full flex items-center justify-center bg-purple-50">
                      <FridaMascot mood="happy" size={88} />
                    </div>
                  ) : preferences.userAvatar?.startsWith("avatar:") ? (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-purple-50 select-none">
                      {PRESET_AVATARS.find((a) => a.id === preferences.userAvatar)?.emoji || "🐾"}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-100 to-indigo-50 text-purple-700 select-none">
                      <span className="text-4xl font-black">
                        {(preferences.userName || "E").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-purple-700">
                      Subiendo...
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Cambiar foto de perfil"
                className="absolute bottom-1 right-1 p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
              >
                Subir foto
              </button>

              {preferences.userAvatar && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    Restablecer
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details & Edit Form */}
          <form onSubmit={handleSaveProfile} className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={32}
                    placeholder="Ej: Tiago, Camila..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-sm text-slate-800 transition-all bg-slate-50/50 focus:bg-white"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nivel de Estudiante
                </label>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-purple-50 border border-purple-100/80">
                  <span className="text-lg">{rank.badge}</span>
                  <div>
                    <span className="text-xs font-bold text-purple-900 block leading-tight">
                      {rank.title}
                    </span>
                    <span className="text-[10px] text-purple-600 font-medium">
                      Nivel {rank.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lema o Biografía de Estudio
              </label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                maxLength={120}
                rows={2}
                placeholder="Escribe una meta o frase que te inspire a estudiar..."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs text-slate-700 transition-all bg-slate-50/50 focus:bg-white resize-none"
              />
              <span className="text-[10px] text-slate-400 block text-right mt-0.5">
                {bioInput.length}/120 caracteres
              </span>
            </div>

            {/* Quick Sticker/Avatar Presets */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 block mb-2">
                O elige un avatar rápido de Frida:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = preferences.userAvatar === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectPreset(avatar.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-300 ring-offset-1 scale-105"
                          : "bg-slate-50 hover:bg-purple-50 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      <span>{avatar.emoji}</span>
                      <span>{avatar.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Progression Banner */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${rank.color} text-white flex items-center justify-center text-2xl shadow-md shrink-0`}
          >
            {rank.badge}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-800">{rank.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                Rango {rank.level} de 5
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Acumula más repasos y mantén tu racha para desbloquear el siguiente rango.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Progreso de Rango</span>
            <span>{rank.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className={`h-full bg-gradient-to-r ${rank.color} rounded-full transition-all duration-500`}
              style={{ width: `${rank.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-sm">
          <div className="p-2 w-fit rounded-xl bg-purple-100 text-purple-600 mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block">Miembro desde</span>
          <span className="text-sm font-black text-slate-800 capitalize">{joinedFormatted}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-sm">
          <div className="p-2 w-fit rounded-xl bg-amber-100 text-amber-600 mb-2">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block">Racha Actual</span>
          <span className="text-base font-black text-slate-800">
            {currentStreak} {currentStreak === 1 ? "día" : "días"}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-sm">
          <div className="p-2 w-fit rounded-xl bg-indigo-100 text-indigo-600 mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block">Total Repasos</span>
          <span className="text-base font-black text-slate-800">{totalReviewsCount}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-sm">
          <div className="p-2 w-fit rounded-xl bg-emerald-100 text-emerald-600 mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block">Colección</span>
          <span className="text-base font-black text-slate-800">
            {cards.length} {cards.length === 1 ? "tarjeta" : "tarjetas"}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            en {subjects.length} {subjects.length === 1 ? "materia" : "materias"}
          </span>
        </div>
      </div>

      {/* MINECRAFT-STYLE ADVANCEMENT TREE */}
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
                Desbloquea logros secuenciales para avanzar en cada rama
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
    </div>
  );
};

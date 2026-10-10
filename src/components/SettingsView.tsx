import React from "react";
import { Volume2, VolumeX, Target, ShieldCheck, Heart } from "lucide-react";
import type { UserPreferences } from "../types";
import { FridaMascot } from "./FridaMascot";
interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}
export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {" "}
      <div>
        {" "}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {" "}
          Configuración{" "}
        </h2>{" "}
        <p className="text-sm opacity-70 mt-1">
          {" "}
          Personaliza tu experiencia de estudio, metas y preferencias en
          Frida{" "}
        </p>{" "}
      </div>{" "}
      {/* Mascot Card */}{" "}
      <div className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-purple-100">
        {" "}
        <FridaMascot mood="happy" size={88} />{" "}
        <div className="text-center sm:text-left space-y-1">
          {" "}
          <h3 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
            {" "}
            <span>¡Hola! Soy Frida 🐾</span>{" "}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {" "}
              Tu compañera de estudio{" "}
            </span>{" "}
          </h3>{" "}
          <p className="text-xs opacity-75 max-w-lg leading-relaxed">
            {" "}
            Te acompaño en cada sesión para que recordar todo lo que estudias
            sea fácil, sin estrés y con la menor fricción posible.{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="space-y-4">
        {" "}
        {/* Daily Goal Section */}{" "}
        <div className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-purple-100">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
              {" "}
              <Target className="w-5 h-5" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h4 className="font-bold text-base">
                Meta Diaria de Repaso
              </h4>{" "}
              <p className="text-xs opacity-70">
                Cantidad de tarjetas que te propones revisar cada día
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            {[10, 20, 30, 50].map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => onUpdatePreferences({ dailyGoal: goal })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${preferences.dailyGoal === goal ? "bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:-translate-y-px" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"}`}
              >
                {" "}
                {goal} tarjetas{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Audio Effects Section */}{" "}
        <div className="bg-white rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm border border-purple-100">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
              {" "}
              {preferences.soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}{" "}
            </div>{" "}
            <div>
              {" "}
              <h4 className="font-bold text-base">Efectos de Sonido</h4>{" "}
              <p className="text-xs opacity-70">
                Campanillas suaves al calificar y fanfarria al completar una
                sesión
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <button
            type="button"
            onClick={() =>
              onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })
            }
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${preferences.soundEnabled ? "bg-purple-600 text-white border-transparent hover:bg-purple-700 hover:-translate-y-px shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
          >
            {" "}
            {preferences.soundEnabled ? "Activados" : "Silenciados"}{" "}
          </button>{" "}
        </div>{" "}
        {/* Privacy & App info */}{" "}
        <div className="bg-white rounded-3xl p-6 flex items-center justify-between text-xs opacity-75 shadow-sm border border-purple-100">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <ShieldCheck className="w-4 h-4 text-emerald-500" />{" "}
            <span>Almacenamiento 100% privado y local en tu equipo.</span>{" "}
          </div>{" "}
          <div className="flex items-center gap-1 font-medium">
            {" "}
            <span>Hecho con</span>{" "}
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />{" "}
            <span>para estudiar mejor</span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

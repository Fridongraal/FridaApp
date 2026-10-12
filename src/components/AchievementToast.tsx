import React, { useEffect, useState } from "react";
import { X, Trophy } from "lucide-react";
import type { Achievement } from "../services/achievements";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  onViewAchievements?: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  onViewAchievements,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!achievement) return;

    setIsExiting(false);
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 350);
    }, 4500);

    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const getBorderColor = () => {
    if (achievement.type === "challenge") {
      return "border-amber-400/90 shadow-amber-500/25";
    } else if (achievement.type === "goal") {
      return "border-purple-400/90 shadow-purple-500/25";
    }
    return "border-indigo-400/80 shadow-indigo-500/20";
  };

  const getBadgeTypeLabel = () => {
    if (achievement.type === "challenge") return "¡Desafío Completado!";
    if (achievement.type === "goal") return "¡Meta Alcanzada!";
    return "¡Logro Desbloqueado!";
  };

  return (
    <div className="fixed top-5 right-5 sm:right-8 z-[100] max-w-sm sm:max-w-md w-full pointer-events-auto">
      <div
        onClick={onViewAchievements}
        className={`group cursor-pointer select-none relative overflow-hidden bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 border-2 ${getBorderColor()} shadow-2xl transition-all duration-300 transform ${
          isExiting
            ? "-translate-y-8 opacity-0 scale-95"
            : "translate-y-0 opacity-100 scale-100 animate-in slide-in-from-top-6 duration-300"
        }`}
        style={{
          boxShadow:
            achievement.type === "challenge"
              ? "0 10px 30px -5px rgba(245, 158, 11, 0.4), inset 0 0 15px rgba(251, 191, 36, 0.15)"
              : "0 10px 30px -5px rgba(124, 58, 237, 0.4), inset 0 0 15px rgba(168, 85, 247, 0.15)",
        }}
      >
        {/* Minecraft-like corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg pointer-events-none" />

        <div className="flex items-center gap-3.5">
          {/* Minecraft icon frame */}
          <div
            className={`w-13 h-13 rounded-xl flex items-center justify-center text-2xl shrink-0 border-2 ${
              achievement.type === "challenge"
                ? "bg-gradient-to-br from-amber-600/40 to-yellow-800/40 border-amber-400 shadow-md shadow-amber-400/30"
                : achievement.type === "goal"
                ? "bg-gradient-to-br from-purple-600/40 to-indigo-800/40 border-purple-400 shadow-md shadow-purple-400/30"
                : "bg-gradient-to-br from-slate-800 to-indigo-900 border-indigo-400 shadow-md"
            }`}
          >
            <span className="transform group-hover:scale-115 transition-transform">
              {achievement.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                {getBadgeTypeLabel()}
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-white truncate leading-tight group-hover:text-purple-200 transition-colors">
              {achievement.title}
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-medium">
              {achievement.description}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress timer bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-purple-400 to-amber-300 animate-[shrink_4.5s_linear_forwards]"
            style={{
              animation: "shrink 4.5s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
};

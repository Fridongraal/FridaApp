import React, { useState, useEffect, useCallback } from "react";
import { X, RotateCw, Keyboard, Flame, Volume2, VolumeX } from "lucide-react";
import type { Flashcard, ReviewRating } from "../types";
import { getIntervalPreviews, calculateSM2 } from "../services/sm2";
import { playCardFlipSound, playRatingSound } from "../services/audio";
import { getUserPreferences, saveUserPreferences } from "../services/db";
import { FridaMascot } from "./FridaMascot";
import { MarkdownContent } from "./MarkdownContent";
import { ImageZoomModal } from "./ImageZoomModal";

interface StudySessionProps {
  title: string;
  cards: Flashcard[];
  isCramMode?: boolean;
  onFinishSession: (reviewedCards: { card: Flashcard; rating: ReviewRating }[]) => void;
  onExit: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  title,
  cards,
  isCramMode = false,
  onFinishSession,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const [reviewedLogs, setReviewedLogs] = useState<{ card: Flashcard; rating: ReviewRating }[]>([]);
  const [zoomImage, setZoomImage] = useState<{ src: string; alt?: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return getUserPreferences().soundEnabled;
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      saveUserPreferences({ soundEnabled: next });
      return next;
    });
  };

  // Queue of cards (can expand as cards are failed/repeated, exactly like Anki)
  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>(cards);
  const [graduatedCardIds, setGraduatedCardIds] = useState<Set<string>>(new Set());

  const currentCard = sessionQueue[currentIndex];
  const totalOriginalCards = Math.max(1, cards.length);
  const progressPercent = Math.min(100, Math.round((graduatedCardIds.size / totalOriginalCards) * 100));
  const remainingCount = Math.max(0, sessionQueue.length - currentIndex);

  const handleFlip = useCallback(() => {
    playCardFlipSound(soundEnabled);
    setIsFlipped((prev) => !prev);
  }, [soundEnabled]);

  const handleRate = useCallback(
    (rating: ReviewRating) => {
      if (!currentCard || isTransitioning) return;
      playRatingSound(rating, soundEnabled);

      const sm2 = calculateSM2(currentCard, rating);
      const newReviewedLogs = [...reviewedLogs, { card: currentCard, rating }];
      setReviewedLogs(newReviewedLogs);

      const updatedCard: Flashcard = {
        ...currentCard,
        interval: sm2.interval,
        repetition: sm2.repetition,
        easeFactor: sm2.easeFactor,
        dueDate: sm2.dueDate,
        state: sm2.state,
      };

      let nextQueue = [...sessionQueue];

      if (sm2.inSessionRepeat) {
        // Re-queue card in current session following Anki's learning steps
        // Rating 1 (< 1m): insert 3-4 cards later or at the end
        // Rating 2 (10m): insert 6-8 cards later or at the end
        const offset = rating === 1 ? 4 : 8;
        const insertIndex = Math.min(nextQueue.length, currentIndex + offset);
        nextQueue.splice(insertIndex, 0, updatedCard);
        setSessionQueue(nextQueue);
      } else {
        // Card graduated or passed review for today!
        setGraduatedCardIds((prev) => new Set(prev).add(currentCard.id));
      }

      // Check if all cards in the queue have been completed
      if (currentIndex + 1 >= nextQueue.length) {
        onFinishSession(newReviewedLogs);
      } else {
        setIsTransitioning(true);
        setTimeout(() => {
          setNoTransition(true);
          setIsFlipped(false);
          setCurrentIndex((prev) => prev + 1);
          setTimeout(() => {
            setNoTransition(false);
            setIsTransitioning(false);
          }, 40);
        }, 160);
      }
    },
    [currentCard, currentIndex, sessionQueue, reviewedLogs, onFinishSession, isTransitioning]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      } else if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRate(1);
        } else if (e.key === "2") {
          e.preventDefault();
          handleRate(2);
        } else if (e.key === "3") {
          e.preventDefault();
          handleRate(3);
        } else if (e.key === "4") {
          e.preventDefault();
          handleRate(4);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, handleRate, handleFlip, onExit]);

  if (!currentCard) {
    return null;
  }

  const intervalPreviews = getIntervalPreviews(currentCard);

  return (
    <div
      className={`fixed inset-0 z-50 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200 transition-colors ${
        isCramMode
          ? "bg-gradient-to-b from-[#FFF5F5]/98 via-[#FFF0F0]/95 to-[#FFF5F5]/98"
          : "bg-[#FBF9FD]/95"
      }`}
    >
      {/* Top Header & Progress */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FridaMascot mood="studying" size={44} className="shrink-0" interactive />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="flex items-center gap-2 truncate">
                <h3 className="text-sm font-bold truncate text-slate-800">{title}</h3>
                {isCramMode && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200/80 shrink-0">
                    <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>Modo Intensivo</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isCramMode
                      ? "bg-rose-100 text-rose-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {remainingCount} {remainingCount === 1 ? "restante" : "restantes"}
                </span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  • {graduatedCardIds.size} de {totalOriginalCards} listas
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div
              className={`w-full h-2 rounded-full overflow-hidden border ${
                isCramMode
                  ? "bg-rose-100/70 border-rose-200/50"
                  : "bg-purple-100/60 border-purple-200/40"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCramMode
                    ? "bg-gradient-to-r from-rose-400 via-red-400 to-rose-500"
                    : "bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-600"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-2xl bg-white border transition-all shrink-0 shadow-sm cursor-pointer ${
              soundEnabled
                ? isCramMode
                  ? "text-rose-600 border-rose-200 hover:bg-rose-50"
                  : "text-purple-600 border-purple-200 hover:bg-purple-50"
                : "text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50"
            }`}
            title={soundEnabled ? "Silenciar efectos de sonido" : "Activar efectos de sonido"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={onExit}
            className={`p-2.5 rounded-2xl bg-white border text-slate-400 hover:text-slate-700 transition-colors shrink-0 shadow-sm cursor-pointer ${
              isCramMode ? "border-rose-200 hover:border-rose-300" : "border-slate-200"
            }`}
            title="Salir de la sesión (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Card Container */}
      <div
        className={`max-w-2xl w-full mx-auto my-auto py-6 card-perspective transition-all duration-200 ${
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div
          onClick={handleFlip}
          className={`card-flipper cursor-pointer select-none ${
            isFlipped ? "is-flipped" : ""
          } ${noTransition ? "no-transition" : ""}`}
        >
          {/* Front Face */}
          <div
            className={`card-face card-face-front min-h-[340px] sm:min-h-[380px] bg-white border rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all ${
              isCramMode
                ? "border-rose-150 hover:border-rose-250 shadow-rose-100/40"
                : "border-purple-100 hover:border-purple-200"
            }`}
          >
            {/* Top card pill indicator */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full ${
                    isCramMode
                      ? "bg-rose-100/80 text-rose-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Pregunta
                </span>
                {currentCard.tags &&
                  currentCard.tags.map((t) => (
                    <span
                      key={t}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCramMode
                          ? "bg-rose-50 text-rose-700 border-rose-200/60"
                          : "bg-purple-50 text-purple-700 border-purple-200/60"
                      }`}
                    >
                      #{t}
                    </span>
                  ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 shrink-0">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Espacio para girar</span>
              </div>
            </div>

            {/* Card Content Area */}
            <div className="my-auto py-6 text-center w-full">
              <MarkdownContent
                content={currentCard.front}
                onZoomImage={(src, alt) => setZoomImage({ src, alt })}
                className="text-xl sm:text-2xl font-medium leading-relaxed max-w-xl mx-auto text-slate-800"
              />
            </div>

            {/* Bottom Card Footer Hint */}
            <div className="text-center text-xs text-slate-400 font-medium">
              <span>Haz clic o presiona [Espacio] para ver la respuesta</span>
            </div>
          </div>

          {/* Back Face */}
          <div
            className={`card-face card-face-back min-h-[340px] sm:min-h-[380px] bg-white border rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-xl ${
              isCramMode
                ? "border-rose-300 ring-2 ring-rose-100"
                : "border-purple-300 ring-2 ring-purple-100"
            }`}
          >
            {/* Top card pill indicator */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full font-bold ${
                    isCramMode
                      ? "bg-rose-100 text-rose-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  Respuesta
                </span>
                {currentCard.tags &&
                  currentCard.tags.map((t) => (
                    <span
                      key={t}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCramMode
                          ? "bg-rose-50 text-rose-700 border-rose-200/60"
                          : "bg-purple-50 text-purple-700 border-purple-200/60"
                      }`}
                    >
                      #{t}
                    </span>
                  ))}
              </div>
              <div
                className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${
                  isCramMode ? "text-rose-400" : "text-purple-400"
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Espacio para girar</span>
              </div>
            </div>

            {/* Card Content Area */}
            <div className="my-auto py-6 text-center space-y-4 w-full">
              <div className="opacity-60 max-w-xl mx-auto">
                <MarkdownContent
                  content={currentCard.front}
                  onZoomImage={(src, alt) => setZoomImage({ src, alt })}
                  className="text-xs font-semibold text-slate-500"
                />
              </div>
              <div
                className={`w-12 h-0.5 mx-auto ${
                  isCramMode ? "bg-rose-300" : "bg-purple-300"
                }`}
              />
              <MarkdownContent
                content={currentCard.back}
                onZoomImage={(src, alt) => setZoomImage({ src, alt })}
                className={`text-base sm:text-xl font-medium leading-relaxed max-w-xl mx-auto ${
                  isCramMode ? "text-rose-950" : "text-purple-950"
                }`}
              />
            </div>

            {/* Bottom Card Footer Hint */}
            <div
              className={`text-center text-xs font-semibold ${
                isCramMode ? "text-rose-600" : "text-purple-600"
              }`}
            >
              <span>¿Qué tal te fue recordándola?</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="max-w-2xl w-full mx-auto pb-4">
        {!isFlipped ? (
          <div className="flex flex-col items-center">
            <button
              onClick={handleFlip}
              className={`w-full sm:w-auto min-w-[300px] py-4 px-8 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors ${
                isCramMode
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/25"
                  : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/25"
              }`}
            >
              <span>Mostrar Respuesta</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-white/20 text-white text-xs font-mono">
                Espacio
              </kbd>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Anki 4-Grade Rating Bar */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {/* 1: Otra vez (< 1 min) */}
              <button
                onClick={() => handleRate(1)}
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 transition-all hover:bg-rose-100 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-xs sm:text-sm font-black text-rose-700">
                  {intervalPreviews[1]}
                </span>
                <div className="flex items-center gap-1 font-bold text-xs sm:text-sm mt-0.5">
                  <span>Otra vez</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-rose-200/80 text-rose-900 hidden sm:inline">
                    1
                  </span>
                </div>
              </button>

              {/* 2: Difícil (10 min) */}
              <button
                onClick={() => handleRate(2)}
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 transition-all hover:bg-amber-100 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-xs sm:text-sm font-black text-amber-700">
                  {intervalPreviews[2]}
                </span>
                <div className="flex items-center gap-1 font-bold text-xs sm:text-sm mt-0.5">
                  <span>Difícil</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-200/80 text-amber-900 hidden sm:inline">
                    2
                  </span>
                </div>
              </button>

              {/* 3: Bien (1 día) */}
              <button
                onClick={() => handleRate(3)}
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 transition-all hover:bg-emerald-100 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-xs sm:text-sm font-black text-emerald-700">
                  {intervalPreviews[3]}
                </span>
                <div className="flex items-center gap-1 font-bold text-xs sm:text-sm mt-0.5">
                  <span>Bien</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-200/80 text-emerald-950 hidden sm:inline">
                    3
                  </span>
                </div>
              </button>

              {/* 4: Fácil (4 días) */}
              <button
                onClick={() => handleRate(4)}
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 transition-all hover:bg-sky-100 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-xs sm:text-sm font-black text-sky-700">
                  {intervalPreviews[4]}
                </span>
                <div className="flex items-center gap-1 font-bold text-xs sm:text-sm mt-0.5">
                  <span>Fácil</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sky-200/80 text-sky-950 hidden sm:inline">
                    4
                  </span>
                </div>
              </button>
            </div>

            <div className="text-center space-y-1">
              <span className="text-[11px] opacity-60 font-medium inline-flex items-center gap-1 text-slate-500">
                <Keyboard className="w-3.5 h-3.5" />
                Responde con las teclas 1, 2, 3 o 4
              </span>
              {isCramMode && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-rose-600">
                  <Flame className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
                  <span>Modo Intensivo: Repaso libre para examen · Tus intervalos programados a largo plazo no se modifican</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Full-screen Zoom Modal */}
      <ImageZoomModal
        isOpen={!!zoomImage}
        src={zoomImage?.src || ""}
        alt={zoomImage?.alt}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
};

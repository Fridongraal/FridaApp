import React, { useState, useEffect, useCallback } from "react";
import { X, RotateCw, Keyboard } from "lucide-react";
import type { Flashcard, ReviewRating } from "../types";
import { getIntervalPreviews } from "../services/sm2";
import { playSuccessChime } from "../services/audio";
import { FridaMascot } from "./FridaMascot";

interface StudySessionProps {
  title: string;
  cards: Flashcard[];
  onFinishSession: (reviewedCards: { card: Flashcard; rating: ReviewRating }[]) => void;
  onExit: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  title,
  cards,
  onFinishSession,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedLogs, setReviewedLogs] = useState<{ card: Flashcard; rating: ReviewRating }[]>([]); 
  
  // Queue of cards
  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>(cards); 
  const currentCard = sessionQueue[currentIndex]; 
  const progressPercent = Math.round((currentIndex / sessionQueue.length) * 100); 
  
  const handleFlip = useCallback(() => { 
    setIsFlipped((prev) => !prev);
  }, []); 
  
  const handleRate = useCallback( (rating: ReviewRating) => { 
    if (!currentCard) return; 
    playSuccessChime(); 
    const newReviewedLogs = [...reviewedLogs, { card: currentCard, rating}]; 
    setReviewedLogs(newReviewedLogs); 
    if (rating === 1) { 
      setSessionQueue((prev) => [...prev, currentCard]);
    } 
    if (currentIndex + 1 >= sessionQueue.length) { 
      onFinishSession(newReviewedLogs);
    } else { 
      setIsFlipped(false); 
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentCard, currentIndex, sessionQueue.length, reviewedLogs, onFinishSession]); 
  
  // Keyboard navigation
  useEffect(() => { 
    const handleKeyDown = (e: KeyboardEvent) => { 
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return; 
      
      if (e.code === 'Space' || e.key === 'Enter') { 
        e.preventDefault(); 
        if (!isFlipped) { 
          setIsFlipped(true);
        }
      } else if (e.key === 'Escape') { 
        e.preventDefault(); 
        onExit();
      } else if (isFlipped) { 
        if (e.key === '1') { 
          e.preventDefault(); 
          handleRate(1);
        } else if (e.key === '2') { 
          e.preventDefault(); 
          handleRate(2);
        } else if (e.key === '3') { 
          e.preventDefault(); 
          handleRate(3);
        }
      }
    }; 
    window.addEventListener('keydown', handleKeyDown); 
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleRate, onExit]); 
  
  if (!currentCard) { 
    return null;
  } 
  
  const intervalPreviews = getIntervalPreviews(currentCard); 
  
  return ( 
    <div className="fixed inset-0 z-50 bg-[#FBF9FD]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"> 
      {/* Top Header & Progress */} 
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between gap-4"> 
        <div className="flex items-center gap-3 flex-1 min-w-0"> 
          <FridaMascot mood="studying" size={44} className="shrink-0" /> 
          <div className="flex-1 min-w-0"> 
            <div className="flex items-center justify-between mb-1.5"> 
              <h3 className="text-sm font-bold truncate text-slate-800"> {title} </h3> 
              <span className="text-xs font-semibold opacity-70"> {currentIndex + 1} de {sessionQueue.length} </span> 
            </div> 
            {/* Progress Bar */} 
            <div className="w-full bg-purple-100/60 h-2 rounded-full overflow-hidden border border-purple-200/40"> 
              <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%`}} /> 
            </div> 
          </div> 
        </div> 
        <button onClick={onExit} className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0 shadow-sm" title="Salir de la sesión" > 
          <X className="w-5 h-5" /> 
        </button> 
      </div> 
      
      {/* Main Flashcard Card Container */} 
      <div className="max-w-2xl w-full mx-auto my-auto py-6"> 
        <div onClick={handleFlip} className={`cursor-pointer min-h-[340px] sm:min-h-[380px] bg-white border border-purple-100 rounded-3xl p-8 sm:p-12 transition-all duration-300 flex flex-col justify-between shadow-2xl select-none relative ${ isFlipped ? 'border-purple-300 ring-2 ring-purple-100 ' : 'hover:-translate-y-1'}`} > 
          {/* Top card pill indicator */} 
          <div className="flex items-center justify-between"> 
            <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full ${ isFlipped ? 'bg-purple-100 text-purple-800 ' : 'bg-slate-100 text-slate-600 '}`} > 
              {isFlipped ? 'Respuesta' : 'Pregunta'} 
            </span> 
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-60"> 
              <RotateCw className="w-3.5 h-3.5" /> 
              <span>Espacio para girar</span> 
            </div> 
          </div> 
          
          {/* Card Content Area */} 
          <div className="my-auto py-6 text-center"> 
            {!isFlipped ? ( 
              <div className="space-y-4"> 
                <p className="text-xl sm:text-2xl lg:text-3xl font-medium leading-relaxed max-w-xl mx-auto"> {currentCard.front} </p> 
              </div> 
            ) : ( 
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200"> 
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50"> {currentCard.front} </p> 
                <div className="w-12 h-0.5 bg-purple-300 mx-auto" /> 
                <p className="text-lg sm:text-2xl font-medium leading-relaxed max-w-xl mx-auto whitespace-pre-wrap text-purple-950"> {currentCard.back} </p> 
              </div> 
            )} 
          </div> 
          
          {/* Bottom Card Footer Hint */} 
          <div className="text-center text-xs opacity-60"> 
            {!isFlipped ? ( 
              <span>Haz clic o presiona [Espacio] para ver la respuesta</span> 
            ) : ( 
              <span className="text-purple-600 font-semibold"> ¿Qué tal te fue recordándola? </span> 
            )} 
          </div> 
        </div> 
      </div> 
      
      {/* Bottom Action Area */} 
      <div className="max-w-2xl w-full mx-auto pb-4"> 
        {!isFlipped ? ( 
          <div className="flex flex-col items-center"> 
            <button onClick={handleFlip} className="w-full sm:w-auto min-w-[300px] py-4 px-8 rounded-2xl bg-purple-600 text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-purple-700" > 
              <span>Mostrar Respuesta</span> 
              <kbd className="px-2 py-0.5 rounded-lg bg-white/20 text-white text-xs font-mono"> Espacio </kbd> 
            </button> 
          </div> 
        ) : ( 
          <div className="space-y-3"> 
            <div className="grid grid-cols-3 gap-3"> 
              {/* 1: Repetir */} 
              <button onClick={() => handleRate(1)} className="group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 transition-all hover:bg-rose-100 cursor-pointer shadow-sm" > 
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base"> 
                  <span>Repetir</span> 
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-200 text-rose-900"> 1 </span> 
                </div> 
                <span className="text-[11px] text-rose-600 font-medium mt-1"> {intervalPreviews[1]} </span> 
              </button> 
              {/* 2: Me costó */} 
              <button onClick={() => handleRate(2)} className="group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 transition-all hover:bg-amber-100 cursor-pointer shadow-sm" > 
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base"> 
                  <span>Me costó</span> 
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900"> 2 </span> 
                </div> 
                <span className="text-[11px] text-amber-600 font-medium mt-1"> {intervalPreviews[2]} </span> 
              </button> 
              {/* 3: Lo sé */} 
              <button onClick={() => handleRate(3)} className="group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-purple-100 border border-purple-300 text-purple-900 transition-all hover:bg-purple-200 cursor-pointer shadow-sm" > 
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base"> 
                  <span>Lo sé</span> 
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-300 text-purple-950"> 3 </span> 
                </div> 
                <span className="text-[11px] text-purple-700 font-medium mt-1"> {intervalPreviews[3]} </span> 
              </button> 
            </div> 
            <div className="text-center"> 
              <span className="text-[11px] opacity-60 font-medium inline-flex items-center gap-1"> 
                <Keyboard className="w-3.5 h-3.5" /> 
                Puedes responder usando las teclas 1, 2 o 3 
              </span> 
            </div> 
          </div> 
        )} 
      </div> 
    </div> 
  );
};

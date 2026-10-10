import React, { useState } from "react";
import { X, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { FridaMascot } from "./FridaMascot";
interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [slide, setSlide] = useState(0);
  if (!isOpen) return null;
  const slides = [
    {
      mood: "studying" as const,
      badge: "El Secreto Científico",
      title: "¿Por qué funciona la repetición espaciada?",
      description:
        "Científicamente, el cerebro olvida la mayor parte de lo aprendido en pocos días si no se ejercita. Frida utiliza el algoritmo SM-2 para calcular el momento exacto en que estás a punto de olvidar un dato, programando el repaso justo a tiempo para fijarlo en tu memoria a largo plazo.",
      tip: "Estudiar 10 minutos al día con este método es más efectivo que estudiar 8 horas seguidas la noche anterior a un examen.",
    },
    {
      mood: "happy" as const,
      badge: "Organización Intuitiva",
      title: "Materias → Unidades → Tarjetas",
      description:
        'Diseñamos Frida para evitar los menús confusos y desordenados de otras aplicaciones. Creas tu Materia (por ejemplo:"Anatomía"), divides por Unidades o Subtemas (ej:"Sistema Nervioso"), y agregas tus tarjetas con Frente y Dorso.',
      tip: "Puedes repasar una sola unidad específica o repasar toda la materia junta cuando prepares un examen general.",
    },
    {
      mood: "celebrating" as const,
      badge: "Tu Única Tarea: 3 Botones Sencillos",
      title: "Cero fricción mental al calificar",
      description:
        'En otras apps dudar entre"Bien" o"Fácil" cansa la cabeza. En Frida solo tienes 3 opciones claras: 1: Repetir (no me acordé), 2: Me costó (dudé), 3: Lo sé (la recordé fácil). Frida calcula todos los intervalos automáticamente.',
      tip: "Usa los atajos de teclado: [Espacio] para voltear y las teclas [1], [2] o [3] para responder al instante.",
    },
  ];
  const current = slides[slide];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {" "}
      <div className="glass-panel bg-white/95 rounded-3xl shadow-2xl border border-purple-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {" "}
        {/* Header */}{" "}
        <div className="px-6 py-4 border-b border-purple-50 flex items-center justify-between">
          {" "}
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            {" "}
            Guía de Frida 🐶{" "}
          </span>{" "}
          <button
            onClick={onClose}
            className="p-1.5 opacity-60 hover:opacity-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>{" "}
        </div>{" "}
        {/* Slide Body */}{" "}
        <div className="p-8 text-center space-y-5">
          {" "}
          <div className="w-20 h-20 rounded-3xl glass-button flex items-center justify-center mx-auto p-2">
            {" "}
            <FridaMascot mood={current.mood} size={70} />{" "}
          </div>{" "}
          <div>
            {" "}
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100/70 text-purple-700 inline-block mb-2">
              {" "}
              {current.badge}{" "}
            </span>{" "}
            <h3 className="text-xl font-bold tracking-tight">
              {" "}
              {current.title}{" "}
            </h3>{" "}
          </div>{" "}
          <p className="text-sm opacity-75 leading-relaxed max-w-md mx-auto">
            {" "}
            {current.description}{" "}
          </p>{" "}
          <div className="p-4 rounded-2xl glass-panel text-left flex items-start gap-3">
            {" "}
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />{" "}
            <p className="text-xs text-purple-950 font-medium leading-relaxed">
              {" "}
              {current.tip}{" "}
            </p>{" "}
          </div>{" "}
          {/* Dots Indicator */}{" "}
          <div className="flex items-center justify-center gap-2 pt-2">
            {" "}
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${slide === idx ? "w-6 bg-purple-600 " : "w-2 bg-slate-300 "}`}
              />
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Footer Actions */}{" "}
        <div className="px-6 py-4 border-t border-purple-50 flex items-center justify-between">
          {" "}
          {slide > 0 ? (
            <button
              onClick={() => setSlide(slide - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {" "}
              <ArrowLeft className="w-3.5 h-3.5" /> <span>Anterior</span>{" "}
            </button>
          ) : (
            <div />
          )}{" "}
          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide(slide + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              {" "}
              <span>Siguiente</span> <ArrowRight className="w-3.5 h-3.5" />{" "}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold glass-button-primary transition-all ml-auto cursor-pointer"
            >
              {" "}
              ¡Entendido, a estudiar!{" "}
            </button>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

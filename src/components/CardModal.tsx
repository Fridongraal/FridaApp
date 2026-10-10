import React, { useState, useEffect } from "react";
import { X, Sparkles, Eye, PlusCircle } from "lucide-react";
import type { Flashcard, Unit } from "../types";
interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    cardData: { front: string; back: string; unitId: string },
    keepOpen?: boolean,
  ) => void;
  initialData?: Flashcard | null;
  units: Unit[];
  defaultUnitId?: string;
}
export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  units,
  defaultUnitId,
}) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [unitId, setUnitId] = useState(defaultUnitId || units[0]?.id || "");
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    if (initialData) {
      setFront(initialData.front);
      setBack(initialData.back);
      setUnitId(initialData.unitId);
    } else {
      setFront("");
      setBack("");
      setUnitId(defaultUnitId || units[0]?.id || "");
    }
    setIsPreview(false);
  }, [initialData, defaultUnitId, units, isOpen]);
  if (!isOpen) return null;
  const handleSave = (keepOpen = false) => {
    if (!front.trim() || !back.trim() || !unitId) return;
    onSave({ front: front.trim(), back: back.trim(), unitId }, keepOpen);
    if (keepOpen) {
      setFront("");
      setBack("");
    } else {
      onClose();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {" "}
      <div
        onKeyDown={handleKeyDown}
        className="glass-panel bg-white/95 rounded-3xl shadow-2xl border border-purple-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {" "}
        {/* Header */}{" "}
        <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-2.5">
            {" "}
            <div className="p-2 rounded-2xl glass-button text-purple-600">
              {" "}
              <Sparkles className="w-4 h-4" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h3 className="text-lg font-bold">
                {" "}
                {initialData ? "Editar Flashcard" : "Nueva Flashcard"}{" "}
              </h3>{" "}
              <p className="text-xs opacity-60">
                {" "}
                Frente para la pregunta y Dorso para la respuesta{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isPreview ? "glass-button-primary" : "glass-button opacity-80"}`}
            >
              {" "}
              <Eye className="w-3.5 h-3.5" />{" "}
              <span>{isPreview ? "Editar" : "Vista previa"}</span>{" "}
            </button>{" "}
            <button
              onClick={onClose}
              className="p-2 opacity-60 hover:opacity-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {" "}
              <X className="w-5 h-5" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Content */}{" "}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {" "}
          {/* Unit selector */}{" "}
          {units.length > 1 && (
            <div>
              {" "}
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70">
                {" "}
                Unidad / Subtema{" "}
              </label>{" "}
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              >
                {" "}
                {units.map((u) => (
                  <option key={u.id} value={u.id} className="">
                    {" "}
                    {u.name}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>
          )}{" "}
          {isPreview ? (
            /* Card Preview Mode */ <div className="space-y-4 py-2">
              {" "}
              <div className="p-6 rounded-2xl glass-panel border border-purple-200/60">
                {" "}
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-2">
                  {" "}
                  Frente (Pregunta){" "}
                </span>{" "}
                <p className="font-medium whitespace-pre-wrap text-base">
                  {" "}
                  {front || (
                    <span className="opacity-40 italic">
                      Escribe el frente...
                    </span>
                  )}{" "}
                </p>{" "}
              </div>{" "}
              <div className="p-6 rounded-2xl glass-panel border border-slate-200/80">
                {" "}
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-2">
                  {" "}
                  Dorso (Respuesta){" "}
                </span>{" "}
                <p className="whitespace-pre-wrap text-base opacity-90">
                  {" "}
                  {back || (
                    <span className="opacity-40 italic">
                      Escribe el dorso...
                    </span>
                  )}{" "}
                </p>{" "}
              </div>{" "}
            </div>
          ) : (
            /* Edit Mode */ <>
              {" "}
              <div>
                {" "}
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70">
                  {" "}
                  Frente (Pregunta o Concepto) *{" "}
                </label>{" "}
                <textarea
                  required
                  autoFocus
                  rows={3}
                  placeholder="¿Cuál es la función de...? o Término a memorizar"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/30 placeholder:opacity-40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-y"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70">
                  {" "}
                  Dorso (Respuesta o Explicación) *{" "}
                </label>{" "}
                <textarea
                  required
                  rows={4}
                  placeholder="La explicación clave o respuesta que necesitas recordar"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/30 placeholder:opacity-40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-y"
                />{" "}
              </div>{" "}
            </>
          )}{" "}
        </div>{" "}
        {/* Footer Actions */}{" "}
        <div className="px-6 py-4 border-t border-purple-50 flex items-center justify-between">
          {" "}
          <span className="text-[11px] opacity-60 font-medium hidden sm:inline">
            {" "}
            Atajo:{" "}
            <kbd className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-900">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-900">
              Enter
            </kbd>{" "}
            para guardar{" "}
          </span>{" "}
          <div className="flex items-center gap-2.5 ml-auto">
            {" "}
            {!initialData && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={!front.trim() || !back.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-button disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {" "}
                <PlusCircle className="w-3.5 h-3.5 text-purple-500" />{" "}
                <span>Guardar y otra</span>{" "}
              </button>
            )}{" "}
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={!front.trim() || !back.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold glass-button-primary disabled:opacity-40 transition-all cursor-pointer"
            >
              {" "}
              {initialData ? "Guardar Cambios" : "Listo"}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

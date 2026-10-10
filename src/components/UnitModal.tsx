import React, { useState, useEffect } from "react";
import { X, Layers } from "lucide-react";
import type { Unit } from "../types";
interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unitData: { name: string; description?: string }) => void;
  initialData?: Unit | null;
  subjectName?: string;
}
export const UnitModal: React.FC<UnitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  subjectName,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || undefined });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {" "}
      <div className="glass-panel bg-white/95 rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {" "}
        <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-2.5">
            {" "}
            <div className="p-2 rounded-2xl glass-button text-purple-600">
              {" "}
              <Layers className="w-4 h-4" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h3 className="text-lg font-bold">
                {" "}
                {initialData ? "Editar Unidad" : "Nueva Unidad"}{" "}
              </h3>{" "}
              {subjectName && (
                <p className="text-xs text-purple-600 font-semibold">
                  En {subjectName}
                </p>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="p-2 opacity-60 hover:opacity-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>{" "}
        </div>{" "}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {" "}
          <div>
            {" "}
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70">
              {" "}
              Título de la unidad o subtema *{" "}
            </label>{" "}
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: Unidad 2: Farmacología Básica"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70">
              {" "}
              Breve descripción (opcional){" "}
            </label>{" "}
            <input
              type="text"
              placeholder="Ej: Mecanismo de acción y conceptos clave"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />{" "}
          </div>{" "}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-purple-50">
            {" "}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold opacity-70 hover:opacity-100 transition-colors cursor-pointer"
            >
              {" "}
              Cancelar{" "}
            </button>{" "}
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold glass-button-primary disabled:opacity-50 transition-all cursor-pointer"
            >
              {" "}
              {initialData ? "Guardar Cambios" : "Crear Unidad"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};

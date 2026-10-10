import React, { useState, useEffect } from "react";
import {
  X,
  Book,
  Brain,
  Code2,
  Palette,
  Globe,
  Sparkles,
  HeartPulse,
} from "lucide-react";
import type { Subject } from "../types";
interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: {
    name: string;
    description: string;
    color: string;
    icon: string;
  }) => void;
  initialData?: Subject | null;
}
const COLOR_OPTIONS = [
  {
    id: "lavender",
    label: "Lavanda",
    bg: "bg-purple-200 ",
    border: "border-purple-400",
    ring: "ring-purple-400",
  },
  {
    id: "indigo",
    label: "Índigo",
    bg: "bg-indigo-200 ",
    border: "border-indigo-400",
    ring: "ring-indigo-400",
  },
  {
    id: "rose",
    label: "Rosa pastel",
    bg: "bg-rose-200 ",
    border: "border-rose-400",
    ring: "ring-rose-400",
  },
  {
    id: "emerald",
    label: "Menta",
    bg: "bg-emerald-200 ",
    border: "border-emerald-400",
    ring: "ring-emerald-400",
  },
  {
    id: "amber",
    label: "Ámbar",
    bg: "bg-amber-200 ",
    border: "border-amber-400",
    ring: "ring-amber-400",
  },
  {
    id: "sky",
    label: "Cielo",
    bg: "bg-sky-200 ",
    border: "border-sky-400",
    ring: "ring-sky-400",
  },
];
const ICON_OPTIONS = [
  { id: "Book", label: "Libro", icon: Book },
  { id: "Brain", label: "Cerebro", icon: Brain },
  { id: "Sparkles", label: "Destello", icon: Sparkles },
  { id: "Code2", label: "Código", icon: Code2 },
  { id: "Palette", label: "Arte", icon: Palette },
  { id: "Globe", label: "Mundo", icon: Globe },
  { id: "HeartPulse", label: "Salud", icon: HeartPulse },
];
export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("lavender");
  const [icon, setIcon] = useState("Sparkles");
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setColor(initialData.color || "lavender");
      setIcon(initialData.icon || "Sparkles");
    } else {
      setName("");
      setDescription("");
      setColor("lavender");
      setIcon("Sparkles");
    }
  }, [initialData, isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), color, icon });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {" "}
      <div className="glass-panel bg-white/95 rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {" "}
        <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
          {" "}
          <div>
            {" "}
            <h3 className="text-lg font-bold">
              {" "}
              {initialData ? "Editar Materia" : "Nueva Materia"}{" "}
            </h3>{" "}
            <p className="text-xs opacity-60">
              {" "}
              Crea una asignatura o temática de estudio{" "}
            </p>{" "}
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
              Nombre de la materia *{" "}
            </label>{" "}
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: Neuroanatomía, Francés A1, Historia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70">
              {" "}
              Descripción o notas (opcional){" "}
            </label>{" "}
            <input
              type="text"
              placeholder="Ej: Cátedra A, finales de diciembre"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
              {" "}
              Color identificador{" "}
            </label>{" "}
            <div className="flex gap-2">
              {" "}
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-9 h-9 rounded-xl ${c.bg} border-2 ${color === c.id ? `${c.border} ring-2 ${c.ring} ring-offset-2 scale-105` : "border-transparent"} transition-all cursor-pointer`}
                  title={c.label}
                />
              ))}{" "}
            </div>{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
              {" "}
              Ícono{" "}
            </label>{" "}
            <div className="flex gap-2 flex-wrap">
              {" "}
              {ICON_OPTIONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setIcon(item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected ? "glass-button-primary shadow-xs" : "glass-button opacity-70 hover:opacity-100"}`}
                    title={item.label}
                  >
                    {" "}
                    <IconComp className="w-4 h-4" />{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
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
              {initialData ? "Guardar Cambios" : "Crear Materia"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};

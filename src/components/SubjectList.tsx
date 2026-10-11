import React from "react";
import {
  Plus,
  Book,
  Brain,
  Sparkles,
  Code2,
  Palette,
  Globe,
  HeartPulse,
  Play,
  MoreVertical,
  Layers,
  FileText,
  Clock,
  Edit3,
} from "lucide-react";
import type { Subject, Flashcard, Unit } from "../types";
import { FridaMascot } from "./FridaMascot";
interface SubjectListProps {
  subjects: Subject[];
  units: Unit[];
  cards: Flashcard[];
  onSelectSubject: (subjectId: string) => void;
  onStartStudy: (subjectId: string) => void;
  onOpenNewSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}
const ICON_MAP: Record<string, React.ElementType> = {
  Book,
  Brain,
  Sparkles,
  Code2,
  Palette,
  Globe,
  HeartPulse,
};
export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  units,
  cards,
  onSelectSubject,
  onStartStudy,
  onOpenNewSubject,
  onEditSubject,
  onDeleteSubject,
}) => {
  const now = Date.now();
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {" "}
      {/* Top Welcome / Header with Mascot */}{" "}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {" "}
        <div className="flex items-center gap-4">
          {" "}
          <FridaMascot
            mood="happy"
            size={56}
            className="hidden sm:inline-flex shrink-0"
          />{" "}
          <div>
            {" "}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {" "}
              Mis Materias{" "}
            </h2>{" "}
            <p className="text-sm opacity-70 mt-0.5">
              {" "}
              Organiza tus asignaturas por unidades y repasa con Frida sin
              sobrecarga{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <button
          onClick={onOpenNewSubject}
          className="glass-button-primary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm cursor-pointer"
        >
          {" "}
          <Plus className="w-4 h-4" /> <span>Nueva Materia</span>{" "}
        </button>{" "}
      </div>{" "}
      {/* Grid of Subjects with Liquid Glass cards */}{" "}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {" "}
          {subjects.map((sub) => {
            const subUnits = units.filter((u) => u.subjectId === sub.id);
            const subCards = cards.filter((c) => c.subjectId === sub.id);
            const dueCards = subCards.filter((c) => c.dueDate <= now);
            const IconComp = ICON_MAP[sub.icon] || Sparkles;
            return (
              <div
                key={sub.id}
                className="group glass-panel rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              >
                {" "}
                <div>
                  {" "}
                  {/* Top Bar of Card */}{" "}
                  <div className="flex items-start justify-between mb-4">
                    {" "}
                    <div className="w-12 h-12 rounded-2xl glass-button flex items-center justify-center text-purple-600 group-hover:scale-105 transition-all">
                      {" "}
                      <IconComp className="w-6 h-6" />{" "}
                    </div>{" "}
                    <div className="flex items-center gap-1.5">
                      {" "}
                      {dueCards.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-800 border border-amber-300/60 shadow-2xs">
                          {" "}
                          <Clock className="w-3 h-3 text-amber-500" />{" "}
                          <span>{dueCards.length} para hoy</span>{" "}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-300/60">
                          {" "}
                          Al día{" "}
                        </span>
                      )}{" "}
                      <button
                        onClick={() => onEditSubject(sub)}
                        title="Editar materia"
                        className="p-1.5 opacity-40 hover:opacity-100 rounded-lg transition-colors cursor-pointer"
                      >
                        {" "}
                        <Edit3 className="w-3.5 h-3.5" />{" "}
                      </button>{" "}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `¿Seguro que deseas eliminar"${sub.name}" y todo su contenido?`,
                            )
                          ) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        title="Eliminar materia"
                        className="p-1.5 opacity-40 hover:opacity-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      >
                        {" "}
                        <MoreVertical className="w-4 h-4" />{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Title & Description */}{" "}
                  <h3
                    onClick={() => onSelectSubject(sub.id)}
                    className="text-lg font-bold hover:text-purple-600 cursor-pointer transition-colors leading-snug mb-1.5"
                  >
                    {" "}
                    {sub.name}{" "}
                  </h3>{" "}
                  <p className="text-xs opacity-70 line-clamp-2 mb-4 leading-relaxed">
                    {" "}
                    {sub.description || "Sin notas adicionales"}{" "}
                  </p>{" "}
                  {/* Counters */}{" "}
                  <div className="flex items-center gap-4 text-xs opacity-75 font-medium py-3 border-y border-purple-100/60 mb-5">
                    {" "}
                    <div className="flex items-center gap-1.5">
                      {" "}
                      <Layers className="w-3.5 h-3.5 text-purple-500" />{" "}
                      <span>
                        {subUnits.length}{" "}
                        {subUnits.length === 1 ? "unidad" : "unidades"}
                      </span>{" "}
                    </div>{" "}
                    <div className="flex items-center gap-1.5">
                      {" "}
                      <FileText className="w-3.5 h-3.5 text-purple-500" />{" "}
                      <span>
                        {subCards.length}{" "}
                        {subCards.length === 1 ? "tarjeta" : "tarjetas"}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Bottom Actions: Study prioritized first */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onStartStudy(sub.id)}
                    disabled={subCards.length === 0}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                    title={
                      subCards.length === 0
                        ? "Agrega tarjetas primero"
                        : "Iniciar sesión de estudio"
                    }
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Estudiar</span>
                  </button>

                  <button
                    onClick={() => onSelectSubject(sub.id)}
                    className="py-2.5 px-3.5 rounded-xl bg-white border border-purple-100 hover:bg-purple-50/60 font-semibold text-xs text-slate-700 transition-colors text-center cursor-pointer shadow-2xs"
                  >
                    Ver unidades
                  </button>
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>
      ) : (
        /* Empty state with Frida Mascot */ <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto my-12 space-y-4">
          {" "}
          <FridaMascot mood="happy" size={96} className="mx-auto" />{" "}
          <h3 className="text-xl font-bold tracking-tight">
            {" "}
            ¡Hola! Comencemos creando tu primera materia{" "}
          </h3>{" "}
          <p className="text-xs opacity-75 max-w-sm mx-auto leading-relaxed">
            {" "}
            Puedes agregar asignaturas de la facultad, temas de estudio o
            idiomas para organizarlos en unidades.{" "}
          </p>{" "}
          <div className="pt-2">
            {" "}
            <button
              onClick={onOpenNewSubject}
              className="glass-button-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer"
            >
              {" "}
              <Plus className="w-4 h-4" />{" "}
              <span>Crear mi primera materia</span>{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

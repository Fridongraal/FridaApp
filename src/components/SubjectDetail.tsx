import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Play,
  Layers,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import type { Subject, Unit, Flashcard } from "../types";
interface SubjectDetailProps {
  subject: Subject;
  units: Unit[];
  cards: Flashcard[];
  onBack: () => void;
  onStartStudySubject: (subjectId: string) => void;
  onStartStudyUnit: (unitId: string) => void;
  onOpenNewUnit: () => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit: (unitId: string) => void;
  onOpenNewCard: (unitId?: string) => void;
  onEditCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
}
export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subject,
  units,
  cards,
  onBack,
  onStartStudySubject,
  onStartStudyUnit,
  onOpenNewUnit,
  onEditUnit,
  onDeleteUnit,
  onOpenNewCard,
  onEditCard,
  onDeleteCard,
}) => {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(
    {},
  );
  const now = Date.now();
  const toggleExpandUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };
  const subjectCards = cards.filter((c) => c.subjectId === subject.id);
  const subjectDueCards = subjectCards.filter((c) => c.dueDate <= now);
  const formatDueDate = (dueDate: number) => {
    if (dueDate <= now)
      return <span className="text-amber-600 font-bold">Hoy</span>;
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return <span className="opacity-80">Mañana</span>;
    return <span className="opacity-60">En {diffDays} días</span>;
  };
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {" "}
      {/* Top back button */}{" "}
      <button
        onClick={onBack}
        className="glass-button inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
      >
        {" "}
        <ArrowLeft className="w-4 h-4" /> <span>Volver a Materias</span>{" "}
      </button>{" "}
      {/* Subject Header Liquid Glass */}{" "}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        {" "}
        <div className="space-y-2">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <span className="w-3.5 h-3.5 rounded-full bg-purple-500 shrink-0" />{" "}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {" "}
              {subject.name}{" "}
            </h2>{" "}
          </div>{" "}
          <p className="text-sm opacity-70 max-w-xl">
            {" "}
            {subject.description || "Sin notas adicionales"}{" "}
          </p>{" "}
          <div className="flex items-center gap-4 text-xs font-medium opacity-75 pt-2">
            {" "}
            <span>
              {units.length} {units.length === 1 ? "Unidad" : "Unidades"}
            </span>{" "}
            <span>•</span>{" "}
            <span>
              {subjectCards.length}{" "}
              {subjectCards.length === 1 ? "Tarjeta" : "Tarjetas en total"}
            </span>{" "}
            <span>•</span>{" "}
            {subjectDueCards.length > 0 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                {" "}
                <Clock className="w-3 h-3" /> {subjectDueCards.length} para
                repasar hoy{" "}
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">
                Al día para hoy
              </span>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* Header Actions */}{" "}
        <div className="flex items-center flex-wrap gap-2.5">
          {" "}
          <button
            onClick={() => onOpenNewCard()}
            disabled={units.length === 0}
            className="px-4 py-2.5 rounded-2xl glass-button disabled:opacity-40 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {" "}
            <Plus className="w-4 h-4 text-purple-600" />{" "}
            <span>Nueva Tarjeta</span>{" "}
          </button>{" "}
          <button
            onClick={onOpenNewUnit}
            className="px-4 py-2.5 rounded-2xl glass-button font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {" "}
            <Layers className="w-4 h-4 text-purple-600" />{" "}
            <span>Nueva Unidad</span>{" "}
          </button>{" "}
          <button
            onClick={() => onStartStudySubject(subject.id)}
            disabled={subjectCards.length === 0}
            className="px-5 py-2.5 rounded-2xl glass-button-primary disabled:opacity-40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {" "}
            <Play className="w-4 h-4 fill-current" />{" "}
            <span>Estudiar Materia</span>{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Units / Subtopics Section */}{" "}
      <div className="space-y-4">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <h3 className="text-lg font-bold flex items-center gap-2">
            {" "}
            <Layers className="w-5 h-5 text-purple-600" />{" "}
            <span>Unidades y Subtemas</span>{" "}
          </h3>{" "}
          <span className="text-xs opacity-60">
            {" "}
            Separa tus tarjetas por capítulos o unidades temáticas{" "}
          </span>{" "}
        </div>{" "}
        {units.length > 0 ? (
          <div className="space-y-3">
            {" "}
            {units.map((unit) => {
              const unitCards = cards.filter((c) => c.unitId === unit.id);
              const dueCount = unitCards.filter((c) => c.dueDate <= now).length;
              const isExpanded = !!expandedUnits[unit.id];
              return (
                <div
                  key={unit.id}
                  className="glass-panel rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  {" "}
                  {/* Unit Bar */}{" "}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    {" "}
                    <div
                      onClick={() => toggleExpandUnit(unit.id)}
                      className="flex-1 cursor-pointer select-none"
                    >
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <h4 className="text-base font-bold hover:text-purple-600 transition-colors">
                          {" "}
                          {unit.name}{" "}
                        </h4>{" "}
                        {dueCount > 0 && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            {" "}
                            {dueCount} para repasar{" "}
                          </span>
                        )}{" "}
                      </div>{" "}
                      {unit.description && (
                        <p className="text-xs opacity-70 mt-0.5">
                          {unit.description}
                        </p>
                      )}{" "}
                      <p className="text-xs opacity-60 font-medium mt-1">
                        {" "}
                        {unitCards.length}{" "}
                        {unitCards.length === 1 ? "tarjeta" : "tarjetas"}{" "}
                      </p>{" "}
                    </div>{" "}
                    {/* Unit actions */}{" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <button
                        onClick={() => onOpenNewCard(unit.id)}
                        title="Agregar tarjeta a esta unidad"
                        className="p-2 rounded-xl glass-button text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {" "}
                        <Plus className="w-4 h-4 text-purple-500" />{" "}
                        <span className="hidden sm:inline">Tarjeta</span>{" "}
                      </button>{" "}
                      <button
                        onClick={() => onStartStudyUnit(unit.id)}
                        disabled={unitCards.length === 0}
                        title="Estudiar solo esta unidad"
                        className="px-3.5 py-1.5 rounded-xl glass-button-primary disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {" "}
                        <Play className="w-3.5 h-3.5 fill-current" />{" "}
                        <span>Estudiar</span>{" "}
                      </button>{" "}
                      <button
                        onClick={() => onEditUnit(unit)}
                        title="Editar unidad"
                        className="p-2 opacity-50 hover:opacity-100 rounded-xl transition-colors cursor-pointer"
                      >
                        {" "}
                        <Edit3 className="w-4 h-4" />{" "}
                      </button>{" "}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Eliminar la unidad"${unit.name}" y sus tarjetas?`,
                            )
                          ) {
                            onDeleteUnit(unit.id);
                          }
                        }}
                        title="Eliminar unidad"
                        className="p-2 opacity-50 hover:opacity-100 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                      >
                        {" "}
                        <Trash2 className="w-4 h-4" />{" "}
                      </button>{" "}
                      <button
                        onClick={() => toggleExpandUnit(unit.id)}
                        className="p-2 opacity-60 hover:opacity-100 rounded-xl transition-colors cursor-pointer"
                        title={isExpanded ? "Contraer" : "Expandir tarjetas"}
                      >
                        {" "}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Expanded Cards List */}{" "}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-purple-100/60 space-y-2">
                      {" "}
                      {unitCards.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {" "}
                          {unitCards.map((card, idx) => (
                            <div
                              key={card.id}
                              className="glass-panel p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs"
                            >
                              {" "}
                              <div className="flex-1 min-w-0">
                                {" "}
                                <div className="flex items-center gap-2 mb-1">
                                  {" "}
                                  <span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                    {" "}
                                    #{idx + 1}{" "}
                                  </span>{" "}
                                  <span className="font-semibold truncate">
                                    {" "}
                                    {card.front}{" "}
                                  </span>{" "}
                                </div>{" "}
                                <p className="opacity-70 truncate pl-6">
                                  {" "}
                                  {card.back}{" "}
                                </p>{" "}
                              </div>{" "}
                              <div className="flex items-center gap-3 shrink-0">
                                {" "}
                                <div className="text-right">
                                  {" "}
                                  <span className="block text-[10px] opacity-50 uppercase font-semibold">
                                    {" "}
                                    Repaso{" "}
                                  </span>{" "}
                                  <span className="text-xs font-medium">
                                    {" "}
                                    {formatDueDate(card.dueDate)}{" "}
                                  </span>{" "}
                                </div>{" "}
                                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                                  {" "}
                                  <button
                                    onClick={() => onEditCard(card)}
                                    className="p-1.5 opacity-50 hover:opacity-100 rounded-lg cursor-pointer"
                                    title="Editar tarjeta"
                                  >
                                    {" "}
                                    <Edit3 className="w-3.5 h-3.5" />{" "}
                                  </button>{" "}
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "¿Seguro que deseas eliminar esta tarjeta?",
                                        )
                                      ) {
                                        onDeleteCard(card.id);
                                      }
                                    }}
                                    className="p-1.5 opacity-50 hover:opacity-100 hover:text-rose-500 rounded-lg cursor-pointer"
                                    title="Eliminar tarjeta"
                                  >
                                    {" "}
                                    <Trash2 className="w-3.5 h-3.5" />{" "}
                                  </button>{" "}
                                </div>{" "}
                              </div>{" "}
                            </div>
                          ))}{" "}
                        </div>
                      ) : (
                        <div className="text-center py-6 opacity-60 text-xs">
                          {" "}
                          <p>No hay tarjetas en esta unidad todavía.</p>{" "}
                          <button
                            onClick={() => onOpenNewCard(unit.id)}
                            className="mt-2 text-purple-600 font-bold hover:underline cursor-pointer"
                          >
                            {" "}
                            + Agregar la primera tarjeta{" "}
                          </button>{" "}
                        </div>
                      )}{" "}
                    </div>
                  )}{" "}
                </div>
              );
            })}{" "}
          </div>
        ) : (
          <div className="glass-panel p-8 text-center rounded-3xl">
            {" "}
            <div className="w-12 h-12 rounded-2xl glass-button text-purple-600 flex items-center justify-center mx-auto mb-3">
              {" "}
              <Layers className="w-6 h-6" />{" "}
            </div>{" "}
            <h4 className="font-bold text-base mb-1">
              {" "}
              Esta materia aún no tiene unidades{" "}
            </h4>{" "}
            <p className="text-xs opacity-70 max-w-md mx-auto mb-4">
              {" "}
              Crea una unidad para agrupar tus conceptos (por ejemplo:"Unidad 1:
              Introducción","Vocabulario de Viaje", etc.){" "}
            </p>{" "}
            <button
              onClick={onOpenNewUnit}
              className="glass-button-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs cursor-pointer"
            >
              {" "}
              <Plus className="w-4 h-4" /> <span>Crear Unidad</span>{" "}
            </button>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};

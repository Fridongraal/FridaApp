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
  Download,
  Upload,
} from "lucide-react";
import type { Subject, Unit, Flashcard } from "../types";
import { exportSubjectCardsToCSV } from "../services/importExport";
import { ImportCsvModal } from "./ImportCsvModal";

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
  onImportCards: (cards: { front: string; back: string; unitId: string }[]) => void;
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
  onImportCards,
}) => {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetUnitForImport, setTargetUnitForImport] = useState<Unit | null>(null);

  const now = Date.now();

  const toggleExpandUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const subjectCards = cards.filter((c) => c.subjectId === subject.id);
  const subjectDueCards = subjectCards.filter((c) => c.dueDate <= now);

  const formatDueDate = (dueDate: number) => {
    if (dueDate <= now) return <span className="text-amber-600 font-bold">Hoy</span>;
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return <span className="opacity-80">Mañana</span>;
    return <span className="opacity-60">En {diffDays} días</span>;
  };

  const cleanMarkdownPreview = (text: string): string => {
    return text
      .replace(/!\[(.*?)\]\(.*?\)/g, "[📷 Imagen]")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[#*`_~>]/g, "")
      .replace(/\n+/g, " ")
      .trim();
  };

  const handleExportCSV = () => {
    if (subjectCards.length === 0) return;
    exportSubjectCardsToCSV(subject.name, units, subjectCards);
  };

  const handleOpenSubjectImport = () => {
    setTargetUnitForImport(null);
    setIsImportModalOpen(true);
  };

  const handleOpenUnitImport = (unit: Unit) => {
    setTargetUnitForImport(unit);
    setIsImportModalOpen(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-purple-100 shadow-sm hover:bg-purple-50/50 transition-colors cursor-pointer text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" /> <span>Volver a Materias</span>
      </button>

      {/* Subject Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-purple-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-500 shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
              {subject.name}
            </h2>
          </div>
          <p className="text-sm opacity-70 max-w-xl text-slate-600">
            {subject.description || "Sin notas adicionales"}
          </p>
          <div className="flex items-center gap-4 text-xs font-medium opacity-75 pt-2 text-slate-500">
            <span>
              {units.length} {units.length === 1 ? "Unidad" : "Unidades"}
            </span>
            <span>•</span>
            <span>
              {subjectCards.length} {subjectCards.length === 1 ? "Tarjeta" : "Tarjetas en total"}
            </span>
            <span>•</span>
            {subjectDueCards.length > 0 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {subjectDueCards.length} para repasar hoy
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">Al día para hoy</span>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Card Management */}
          <button
            onClick={() => onOpenNewCard()}
            disabled={units.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-white border border-purple-100 shadow-sm hover:bg-purple-50/50 disabled:opacity-40 font-semibold text-xs flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Nueva Tarjeta</span>
          </button>

          <button
            onClick={handleOpenSubjectImport}
            disabled={units.length === 0}
            title={units.length === 0 ? "Crea una unidad primero" : "Importar tarjetas desde un archivo CSV"}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-purple-100 shadow-sm hover:bg-purple-50/50 disabled:opacity-40 font-semibold text-xs flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Importar CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={subjectCards.length === 0}
            title={subjectCards.length === 0 ? "No hay tarjetas para exportar" : "Descargar tarjetas en formato CSV"}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-purple-100 shadow-sm hover:bg-purple-50/50 disabled:opacity-40 font-semibold text-xs flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewUnit}
            className="px-4 py-2.5 rounded-2xl bg-white border border-purple-100 shadow-sm hover:bg-purple-50/50 font-semibold text-xs flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Nueva Unidad</span>
          </button>

          <button
            onClick={() => onStartStudySubject(subject.id)}
            disabled={subjectCards.length === 0}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white shadow-md hover:bg-purple-700 disabled:opacity-40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:-translate-y-px"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Estudiar Materia</span>
          </button>
        </div>
      </div>

      {/* Units / Subtopics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Layers className="w-5 h-5 text-purple-600" />
            <span>Unidades y Subtemas</span>
          </h3>
          <span className="text-xs opacity-60 text-slate-500">
            Separa tus tarjetas por capítulos o unidades temáticas
          </span>
        </div>

        {units.length > 0 ? (
          <div className="space-y-3">
            {units.map((unit) => {
              const unitCards = cards.filter((c) => c.unitId === unit.id);
              const dueCount = unitCards.filter((c) => c.dueDate <= now).length;
              const isExpanded = !!expandedUnits[unit.id];

              return (
                <div
                  key={unit.id}
                  className="bg-white rounded-2xl overflow-hidden transition-all shadow-sm border border-purple-100"
                >
                  {/* Unit Bar */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div
                      onClick={() => toggleExpandUnit(unit.id)}
                      className="flex-1 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-slate-800 hover:text-purple-600 transition-colors">
                          {unit.name}
                        </h4>
                        {dueCount > 0 && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            {dueCount} para repasar
                          </span>
                        )}
                      </div>
                      {unit.description && (
                        <p className="text-xs opacity-70 text-slate-500 mt-0.5">
                          {unit.description}
                        </p>
                      )}
                      <p className="text-xs opacity-60 font-medium text-slate-400 mt-1">
                        {unitCards.length} {unitCards.length === 1 ? "tarjeta" : "tarjetas"}
                      </p>
                    </div>

                    {/* Unit actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenNewCard(unit.id)}
                        title="Agregar tarjeta a esta unidad"
                        className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4 text-purple-600" />
                        <span className="hidden sm:inline">Tarjeta</span>
                      </button>

                      <button
                        onClick={() => handleOpenUnitImport(unit)}
                        title={`Importar CSV directamente a "${unit.name}"`}
                        className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 text-purple-600" />
                        <span className="hidden sm:inline">CSV</span>
                      </button>

                      <button
                        onClick={() => onStartStudyUnit(unit.id)}
                        disabled={unitCards.length === 0}
                        title="Estudiar solo esta unidad"
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white shadow-sm hover:bg-purple-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Estudiar</span>
                      </button>

                      <button
                        onClick={() => onEditUnit(unit)}
                        title="Editar unidad"
                        className="p-2 opacity-50 hover:opacity-100 rounded-xl transition-colors cursor-pointer text-slate-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Eliminar la unidad "${unit.name}" y todas sus tarjetas?`
                            )
                          ) {
                            onDeleteUnit(unit.id);
                          }
                        }}
                        title="Eliminar unidad"
                        className="p-2 opacity-50 hover:opacity-100 hover:text-rose-500 rounded-xl transition-colors cursor-pointer text-slate-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpandUnit(unit.id)}
                        className="p-2 opacity-60 hover:opacity-100 rounded-xl transition-colors cursor-pointer text-slate-600"
                        title={isExpanded ? "Contraer" : "Expandir tarjetas"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Cards List */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-purple-50 space-y-2">
                      {unitCards.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {unitCards.map((card, idx) => (
                            <div
                              key={card.id}
                              className="bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded text-[11px]">
                                    #{idx + 1}
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate">
                                    {cleanMarkdownPreview(card.front)}
                                  </span>
                                </div>
                                <p className="opacity-70 text-slate-600 truncate pl-6">
                                  {cleanMarkdownPreview(card.back)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <span className="block text-[10px] opacity-50 uppercase font-semibold text-slate-400">
                                    Repaso
                                  </span>
                                  <span className="text-xs font-medium text-slate-700">
                                    {formatDueDate(card.dueDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                                  <button
                                    onClick={() => onEditCard(card)}
                                    className="p-1.5 opacity-50 hover:opacity-100 rounded-lg cursor-pointer text-slate-600"
                                    title="Editar tarjeta"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "¿Seguro que deseas eliminar esta tarjeta?"
                                        )
                                      ) {
                                        onDeleteCard(card.id);
                                      }
                                    }}
                                    className="p-1.5 opacity-50 hover:opacity-100 hover:text-rose-500 rounded-lg cursor-pointer text-slate-600"
                                    title="Eliminar tarjeta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 opacity-60 text-xs text-slate-500">
                          <p>No hay tarjetas en esta unidad todavía.</p>
                          <div className="flex items-center justify-center gap-4 mt-2">
                            <button
                              onClick={() => onOpenNewCard(unit.id)}
                              className="text-purple-600 font-bold hover:underline cursor-pointer"
                            >
                              + Agregar tarjeta manual
                            </button>
                            <span>o</span>
                            <button
                              onClick={() => handleOpenUnitImport(unit)}
                              className="text-purple-600 font-bold hover:underline cursor-pointer"
                            >
                              Importar archivo CSV
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 text-center rounded-3xl border border-purple-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base mb-1 text-slate-800">
              Esta materia aún no tiene unidades
            </h4>
            <p className="text-xs opacity-70 max-w-md mx-auto mb-4 text-slate-500">
              Crea una unidad para agrupar tus conceptos (por ejemplo: "Unidad 1: Introducción", "Vocabulario de Viaje", etc.)
            </p>
            <button
              onClick={onOpenNewUnit}
              className="bg-purple-600 text-white shadow-sm hover:bg-purple-700 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> <span>Crear Unidad</span>
            </button>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        units={units}
        subjectName={subject.name}
        targetUnit={targetUnitForImport}
        onImport={onImportCards}
      />
    </div>
  );
};

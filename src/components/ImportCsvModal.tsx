import React, { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import type { Unit } from "../types";
import { parseCardsCSV, type ParsedCSVCard } from "../services/importExport";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  subjectName: string;
  defaultUnitId?: string;
  onImport: (cards: { front: string; back: string; unitId: string }[]) => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  units,
  subjectName,
  defaultUnitId,
  onImport,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    defaultUnitId || units[0]?.id || ""
  );
  const [fileName, setFileName] = useState<string>("");
  const [parsedCards, setParsedCards] = useState<ParsedCSVCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    try {
      const text = await file.text();
      const result = parseCardsCSV(text, selectedUnitId || units[0]?.id || "", units);
      if (result.error) {
        setError(result.error);
        setParsedCards([]);
      } else if (result.cards.length === 0) {
        setError("No se encontraron tarjetas con formato válido en el archivo.");
        setParsedCards([]);
      } else {
        setParsedCards(result.cards);
      }
    } catch (err) {
      console.error(err);
      setError("Error al leer el archivo. Asegúrate de que sea un archivo de texto o CSV.");
      setParsedCards([]);
    }
  };

  const handleUnitChange = (newUnitId: string) => {
    setSelectedUnitId(newUnitId);
    // Update unitId in parsed cards if they don't have a specific unit matched
    setParsedCards((prev) =>
      prev.map((c) => ({
        ...c,
        unitId: c.unitName ? c.unitId : newUnitId,
      }))
    );
  };

  const handleConfirmImport = () => {
    if (parsedCards.length === 0) return;

    const cardsToImport = parsedCards.map((c) => ({
      front: c.front,
      back: c.back,
      unitId: c.unitId || selectedUnitId || units[0]?.id || "",
    }));

    onImport(cardsToImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl border border-purple-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Importar Tarjetas desde CSV</h3>
              <p className="text-xs text-purple-600 font-medium">Materia: {subjectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 opacity-60 hover:opacity-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Unit Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Unidad de destino predeterminada
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Si tu CSV incluye una tercera columna con el nombre de la unidad, se asignará automáticamente.
            </p>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Seleccionar archivo (.csv, .txt, .tsv)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt,.tsv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl p-6 text-center cursor-pointer bg-purple-50/20 hover:bg-purple-50/50 transition-all"
            >
              <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              {fileName ? (
                <div>
                  <p className="text-sm font-bold text-slate-800">{fileName}</p>
                  <p className="text-xs text-purple-600 mt-0.5">Haz clic para elegir otro archivo</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-700">Haz clic aquí para seleccionar tu archivo CSV</p>
                  <p className="text-xs text-slate-400 mt-0.5">Compatible con exportaciones de Anki, Quizlet y Excel</p>
                </div>
              )}
            </div>
          </div>

          {/* Format Help Toggle */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between text-xs font-bold text-purple-800 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>¿Cómo debe ser el formato del CSV?</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {showHelp ? "Ocultar" : "Ver formato"}
              </span>
            </button>

            {showHelp && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2">
                <p>El archivo puede estar separado por comas (,), punto y coma (;) o tabulaciones.</p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  Frente,Dorso,Unidad<br />
                  "¿Qué es la mitosis?","Es la división celular...",Unidad 1<br />
                  "¿Qué es el ADN?","Ácido desoxirribonucleico...",Unidad 1
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 Si usas Anki, puedes exportar tu mazo como "Notas en texto plano" y seleccionarlo directamente aquí.
                </p>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedCards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{parsedCards.length} tarjetas detectadas</span>
                </span>
                <span className="text-[11px] text-slate-400">Vista previa (primeras 4)</span>
              </div>

              <div className="border border-purple-100 rounded-xl overflow-hidden divide-y divide-purple-50 max-h-48 overflow-y-auto">
                {parsedCards.slice(0, 4).map((c, i) => (
                  <div key={i} className="p-2.5 text-xs bg-white flex items-start gap-3">
                    <span className="font-bold text-purple-600 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{c.front}</p>
                      <p className="text-slate-500 truncate mt-0.5">{c.back}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-50 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={parsedCards.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm hover:bg-purple-700 disabled:opacity-40 transition-all cursor-pointer"
          >
            Importar {parsedCards.length > 0 ? `${parsedCards.length} tarjetas` : "tarjetas"}
          </button>
        </div>
      </div>
    </div>
  );
};

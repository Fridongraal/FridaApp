import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Eye,
  PlusCircle,
  Layers,
  Bold,
  Italic,
  Code,
  FileCode,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Loader2,
  Tag,
} from "lucide-react";
import type { Flashcard, Unit } from "../types";
import { MarkdownContent } from "./MarkdownContent";
import { ImageZoomModal } from "./ImageZoomModal";
import { compressImageToDataUrl } from "../services/imageUtils";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    cardData: { front: string; back: string; unitId: string; tags?: string[] },
    keepOpen?: boolean
  ) => void;
  initialData?: Flashcard | null;
  units: Unit[];
  defaultUnitId?: string;
  isUnitLocked?: boolean;
  availableTags?: string[];
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  units,
  defaultUnitId,
  isUnitLocked = false,
  availableTags = [],
}) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [unitId, setUnitId] = useState(defaultUnitId || units[0]?.id || "");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ src: string; alt?: string } | null>(null);

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontImageInputRef = useRef<HTMLInputElement>(null);
  const backImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFront(initialData.front);
      setBack(initialData.back);
      setUnitId(initialData.unitId);
      setTags(initialData.tags || []);
    } else {
      setFront("");
      setBack("");
      setUnitId(defaultUnitId || units[0]?.id || "");
      setTags([]);
    }
    setTagInput("");
    setIsPreview(false);
  }, [initialData, defaultUnitId, units, isOpen]);

  if (!isOpen) return null;

  const targetUnit =
    units.find((u) => u.id === unitId) ||
    units.find((u) => u.id === defaultUnitId) ||
    units[0];

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#+/, "").toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSave = (keepOpen = false) => {
    const finalUnitId = isUnitLocked ? defaultUnitId || unitId : unitId;
    if (!front.trim() || !back.trim() || !finalUnitId) return;
    onSave(
      { front: front.trim(), back: back.trim(), unitId: finalUnitId, tags },
      keepOpen
    );
    if (keepOpen) {
      setFront("");
      setBack("");
      setTags([]);
      setTagInput("");
      frontRef.current?.focus();
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

  const applyMarkdown = (
    field: "front" | "back",
    wrapperStart: string,
    wrapperEnd = wrapperStart,
    placeholder = "texto"
  ) => {
    const textarea = field === "front" ? frontRef.current : backRef.current;
    const value = field === "front" ? front : back;
    const setter = field === "front" ? setFront : setBack;

    if (!textarea) {
      setter((prev) => `${prev}${wrapperStart}${placeholder}${wrapperEnd}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;

    const before = value.substring(0, start);
    const after = value.substring(end);
    const updated = `${before}${wrapperStart}${selectedText}${wrapperEnd}${after}`;

    setter(updated);

    setTimeout(() => {
      textarea.focus();
      const newStart = start + wrapperStart.length;
      const newEnd = newStart + selectedText.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 10);
  };

  const handleInsertImage = async (field: "front" | "back", file: File) => {
    setIsProcessingImage(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const alt = file.name ? file.name.replace(/\.[^/.]+$/, "") : "Imagen";
      
      const textarea = field === "front" ? frontRef.current : backRef.current;
      const value = field === "front" ? front : back;
      const setter = field === "front" ? setFront : setBack;

      const markdownImg = `\n![${alt}](${dataUrl})\n`;

      if (!textarea) {
        setter((prev) => `${prev}${markdownImg}`);
      } else {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = value.substring(0, start);
        const after = value.substring(end);
        const updated = `${before}${markdownImg}${after}`;
        setter(updated);

        setTimeout(() => {
          textarea.focus();
          const newPos = start + markdownImg.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 10);
      }
    } catch (err) {
      console.error("Error al procesar la imagen:", err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    field: "front" | "back"
  ) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleInsertImage(field, file);
        }
        return;
      }
    }
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLTextAreaElement>,
    field: "front" | "back"
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await handleInsertImage(field, file);
    }
  };

  const renderToolbar = (field: "front" | "back", label: string) => (
    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-0.5 bg-purple-50/70 p-0.5 rounded-xl border border-purple-100/70 shadow-2xs">
        <button
          type="button"
          onClick={() => applyMarkdown(field, "**", "**", "negrita")}
          className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
          title="Negrita (**texto**)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyMarkdown(field, "*", "*", "cursiva")}
          className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
          title="Cursiva (*texto*)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyMarkdown(field, "`", "`", "código")}
          className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
          title="Código en línea (`código`)"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyMarkdown(field, "\n```\n", "\n```\n", "código")}
          className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
          title="Bloque de código (```...```)"
        >
          <FileCode className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyMarkdown(field, "\n- ", "", "elemento")}
          className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
          title="Lista de viñetas (- elemento)"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyMarkdown(field, "\n1. ", "", "elemento")}
          className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
          title="Lista numerada (1. elemento)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyMarkdown(field, "\n> ", "", "cita")}
          className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
          title="Cita (> texto)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        {/* Image upload button */}
        <button
          type="button"
          onClick={() => (field === "front" ? frontImageInputRef.current : backImageInputRef.current)?.click()}
          className="p-1 hover:bg-white rounded-lg text-purple-700 hover:text-purple-900 transition-colors cursor-pointer border-l border-purple-200/50 pl-1.5 ml-0.5"
          title="Subir imagen (o pegar con Ctrl+V o arrastrar)"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onKeyDown={handleKeyDown}
        className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Hidden image file inputs */}
        <input
          ref={frontImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleInsertImage("front", file);
            e.target.value = "";
          }}
        />
        <input
          ref={backImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleInsertImage("back", file);
            e.target.value = "";
          }}
        />

        {/* Header */}
        <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-100 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {initialData ? "Editar Flashcard" : "Nueva Flashcard"}
              </h3>
              <p className="text-xs opacity-60 text-slate-500">
                Soporta Markdown, imágenes con Ctrl+V o arrastrando
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPreview
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreview ? "Editar" : "Vista previa"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 opacity-60 hover:opacity-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Processing Image Banner */}
        {isProcessingImage && (
          <div className="px-6 py-2.5 bg-purple-50 border-b border-purple-100 flex items-center gap-2 text-xs font-semibold text-purple-700 animate-in fade-in">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Optimizando e insertando imagen...</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Unit indicator or selector */}
          {isUnitLocked && targetUnit ? (
            /* Locked unit banner */
            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0 shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  Unidad fija: <span className="text-purple-700">{targetUnit.name}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Esta tarjeta se guardará directamente en esta unidad.
                </p>
              </div>
            </div>
          ) : (
            /* Selectable dropdown when adding from general subject */
            units.length > 1 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">
                  Unidad / Subtema
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium text-slate-800"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}

          {isPreview ? (
            /* Card Preview Mode */
            <div className="space-y-4 py-2">
              <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-200/60 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-2">
                  Frente (Pregunta)
                </span>
                {front.trim() ? (
                  <MarkdownContent
                    content={front}
                    className="text-base text-slate-800"
                    onZoomImage={(src, alt) => setZoomImage({ src, alt })}
                  />
                ) : (
                  <span className="opacity-40 italic text-sm text-slate-500">
                    Escribe el frente...
                  </span>
                )}
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Dorso (Respuesta)
                </span>
                {back.trim() ? (
                  <MarkdownContent
                    content={back}
                    className="text-base text-slate-700"
                    onZoomImage={(src, alt) => setZoomImage({ src, alt })}
                  />
                ) : (
                  <span className="opacity-40 italic text-sm text-slate-500">
                    Escribe el dorso...
                  </span>
                )}
              </div>
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 px-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Etiquetas:</span>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <>
              <div>
                {renderToolbar("front", "Frente (Pregunta o Concepto) *")}
                <textarea
                  ref={frontRef}
                  required
                  autoFocus
                  rows={3}
                  placeholder="Escribe tu pregunta... (pega imágenes con Ctrl+V o usa el botón de imagen)"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  onPaste={(e) => handlePaste(e, "front")}
                  onDrop={(e) => handleDrop(e, "front")}
                  className="w-full px-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/20 placeholder:opacity-40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-y text-slate-800 font-sans"
                />
              </div>
              <div>
                {renderToolbar("back", "Dorso (Respuesta o Explicación) *")}
                <textarea
                  ref={backRef}
                  required
                  rows={5}
                  placeholder="Escribe la respuesta... (pega diagramas o esquemas con Ctrl+V)"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  onPaste={(e) => handlePaste(e, "back")}
                  onDrop={(e) => handleDrop(e, "back")}
                  className="w-full px-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/20 placeholder:opacity-40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-y text-slate-800 font-sans"
                />
              </div>

              {/* Tags Input Section */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Etiquetas / Tags</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">
                    Presiona Enter o coma para añadir
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl border border-purple-100 bg-purple-50/20 focus-within:ring-2 focus-within:ring-purple-400 transition-all">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold shadow-2xs"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="opacity-50 hover:opacity-100 text-purple-900 cursor-pointer ml-0.5"
                        title="Eliminar etiqueta"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <div className="flex-1 min-w-[140px] flex items-center">
                    <input
                      type="text"
                      placeholder={
                        tags.length === 0
                          ? "Ej: examen, fórmulas, anatomía..."
                          : "Añadir otra etiqueta..."
                      }
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium px-1 py-0.5"
                    />
                    {tagInput.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAddTag(tagInput)}
                        className="px-2 py-0.5 rounded-lg bg-purple-600 text-white text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        Añadir
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions from available tags */}
                {availableTags && availableTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5 pl-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Sugerencias:</span>
                    {availableTags
                      .filter((t) => !tags.includes(t))
                      .slice(0, 6)
                      .map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTag(t)}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
                        >
                          +{t}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-purple-50 flex items-center justify-between bg-slate-50/40">
          <span className="text-[11px] opacity-60 font-medium hidden sm:inline text-slate-500">
            Atajo:{" "}
            <kbd className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-900 font-mono text-[10px]">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-900 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            para guardar
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            {!initialData && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={!front.trim() || !back.trim() || isProcessingImage}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-50 border border-purple-100 text-purple-700 hover:bg-purple-100 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
                <span>Guardar y otra</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={!front.trim() || !back.trim() || isProcessingImage}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 disabled:opacity-40 transition-all cursor-pointer hover:-translate-y-px active:translate-y-0"
            >
              {initialData ? "Guardar Cambios" : "Listo"}
            </button>
          </div>
        </div>
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

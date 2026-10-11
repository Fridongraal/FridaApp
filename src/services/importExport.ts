import { db, getUserPreferences, saveUserPreferences } from "./db";
import type { Subject, Unit, Flashcard, ReviewLog, UserPreferences } from "../types";

export interface BackupData {
  version: number;
  app: "Frida";
  exportedAt: string;
  preferences: UserPreferences;
  subjects: Subject[];
  units: Unit[];
  cards: Flashcard[];
  reviewLogs: ReviewLog[];
}

/**
 * Triggers a browser file download for text content
 */
export function downloadFile(content: string, filename: string, mimeType = "application/json") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports full application state (database + preferences) to a JSON file
 */
export async function exportFullBackup(): Promise<void> {
  const subjects = await db.subjects.toArray();
  const units = await db.units.toArray();
  const cards = await db.cards.toArray();
  const reviewLogs = await db.reviewLogs.toArray();
  const preferences = getUserPreferences();

  const backup: BackupData = {
    version: 1,
    app: "Frida",
    exportedAt: new Date().toISOString(),
    preferences,
    subjects,
    units,
    cards,
    reviewLogs,
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const dateStr = new Date().toISOString().split("T")[0];
  downloadFile(jsonString, `frida-backup-${dateStr}.json`, "application/json;charset=utf-8");
}

/**
 * Imports a JSON backup file and replaces / restores current database and preferences
 */
export async function importFullBackup(file: File): Promise<{
  success: boolean;
  message: string;
  stats?: { subjects: number; units: number; cards: number; reviewLogs: number };
}> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as Partial<BackupData>;

    if (!data || !Array.isArray(data.subjects) || !Array.isArray(data.cards)) {
      return {
        success: false,
        message: "El archivo no tiene el formato válido de copia de seguridad de Frida.",
      };
    }

    const subjects = data.subjects || [];
    const units = data.units || [];
    const cards = data.cards || [];
    const reviewLogs = data.reviewLogs || [];

    // Clear and restore tables in a single atomic transaction
    await db.transaction("rw", db.subjects, db.units, db.cards, db.reviewLogs, async () => {
      await db.subjects.clear();
      await db.units.clear();
      await db.cards.clear();
      await db.reviewLogs.clear();

      if (subjects.length > 0) await db.subjects.bulkAdd(subjects);
      if (units.length > 0) await db.units.bulkAdd(units);
      if (cards.length > 0) await db.cards.bulkAdd(cards);
      if (reviewLogs.length > 0) await db.reviewLogs.bulkAdd(reviewLogs);
    });

    if (data.preferences) {
      saveUserPreferences(data.preferences);
    }

    return {
      success: true,
      message: `Copia restaurada con éxito: ${subjects.length} materias, ${units.length} unidades y ${cards.length} tarjetas.`,
      stats: {
        subjects: subjects.length,
        units: units.length,
        cards: cards.length,
        reviewLogs: reviewLogs.length,
      },
    };
  } catch (error) {
    console.error("Error al restaurar copia de seguridad:", error);
    return {
      success: false,
      message: "Ocurrió un error al leer o procesar el archivo de copia de seguridad.",
    };
  }
}

/**
 * Escapes a field for standard CSV
 */
function escapeCSVField(str: string): string {
  if (!str) return "";
  const needsQuotes = str.includes(",") || str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r");
  if (!needsQuotes) return str;
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exports all cards of a given subject into CSV format
 */
export function exportSubjectCardsToCSV(subjectName: string, units: Unit[], cards: Flashcard[]): void {
  const unitMap = new Map<string, string>();
  for (const u of units) {
    unitMap.set(u.id, u.name);
  }

  const rows: string[] = ["Frente,Dorso,Unidad"];

  for (const card of cards) {
    const unitName = unitMap.get(card.unitId) || "";
    const f = escapeCSVField(card.front);
    const b = escapeCSVField(card.back);
    const u = escapeCSVField(unitName);
    rows.push(`${f},${b},${u}`);
  }

  // Prepend UTF-8 BOM so Excel and other Windows tools open accented characters properly
  const csvContent = "\uFEFF" + rows.join("\r\n");
  const cleanName = subjectName.replace(/[^a-zA-Z0-9_\u00C0-\u017F-]/g, "_").toLowerCase();
  downloadFile(csvContent, `${cleanName}_tarjetas.csv`, "text/csv;charset=utf-8");
}

export interface ParsedCSVCard {
  front: string;
  back: string;
  unitName?: string;
  unitId?: string;
}

/**
 * Parses CSV/TSV text handling quotes, multi-line fields, and delimiters (, or ; or \t)
 */
export function parseCardsCSV(
  rawText: string,
  defaultUnitId: string,
  units: Unit[],
  overrideUnitId?: string
): { cards: ParsedCSVCard[]; error?: string } {
  // Strip UTF-8 BOM if present
  let text = rawText;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  if (!text.trim()) {
    return { cards: [], error: "El archivo está vacío." };
  }

  // Detect delimiter: check first line
  const firstLine = text.split(/\r?\n/)[0] || "";
  let delimiter = ",";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;

  if (tabs > commas && tabs > semicolons) {
    delimiter = "\t";
  } else if (semicolons > commas) {
    delimiter = ";";
  }

  // Parse CSV records respecting quotes
  const records: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i += 2;
        continue;
      } else if (char === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = "";
        i++;
        continue;
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++;
        }
        currentRow.push(currentField.trim());
        records.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
        continue;
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        records.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Flush remaining field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    records.push(currentRow);
  }

  if (records.length === 0) {
    return { cards: [], error: "No se encontraron datos en el archivo." };
  }

  // Check if first row is a header
  let startIndex = 0;
  const firstRow = records[0];
  if (firstRow && firstRow.length >= 2) {
    const col0 = firstRow[0].toLowerCase();
    const col1 = firstRow[1].toLowerCase();
    if (
      col0.includes("frente") ||
      col0.includes("front") ||
      col0.includes("pregunta") ||
      col0.includes("question") ||
      col1.includes("dorso") ||
      col1.includes("back") ||
      col1.includes("respuesta") ||
      col1.includes("answer")
    ) {
      startIndex = 1;
    }
  }

  // Map unit names for fast lookup
  const unitNameToId = new Map<string, string>();
  for (const u of units) {
    unitNameToId.set(u.name.toLowerCase().trim(), u.id);
  }

  const parsedCards: ParsedCSVCard[] = [];

  for (let r = startIndex; r < records.length; r++) {
    const row = records[r];
    if (row.length < 2) continue; // Needs at least front and back

    const front = row[0]?.trim();
    const back = row[1]?.trim();
    const unitName = row[2]?.trim();

    if (!front && !back) continue;

    let matchedUnitId = overrideUnitId || defaultUnitId;
    if (!overrideUnitId && unitName && unitNameToId.has(unitName.toLowerCase())) {
      matchedUnitId = unitNameToId.get(unitName.toLowerCase())!;
    }

    parsedCards.push({
      front: front || "(Vacío)",
      back: back || "(Vacío)",
      unitName: overrideUnitId ? undefined : (unitName || undefined),
      unitId: matchedUnitId,
    });
  }

  return { cards: parsedCards };
}

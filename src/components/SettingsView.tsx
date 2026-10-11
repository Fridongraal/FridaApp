import React, { useState, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Target,
  ShieldCheck,
  Heart,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { UserPreferences } from "../types";
import { FridaMascot } from "./FridaMascot";
import { exportFullBackup, importFullBackup } from "../services/importExport";

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onBackupRestored?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onBackupRestored,
}) => {
  const [backupStatus, setBackupStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setBackupStatus({ type: null, message: "" });
    try {
      await exportFullBackup();
      setBackupStatus({
        type: "success",
        message: "¡Copia de seguridad descargada exitosamente en formato JSON!",
      });
    } catch (err) {
      console.error(err);
      setBackupStatus({
        type: "error",
        message: "Hubo un problema al generar la copia de seguridad.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        "¿Deseas restaurar esta copia de seguridad? Se reemplazarán las materias y tarjetas actuales por las del archivo."
      )
    ) {
      e.target.value = "";
      return;
    }

    setIsImporting(true);
    setBackupStatus({ type: null, message: "" });

    try {
      const res = await importFullBackup(file);
      if (res.success) {
        setBackupStatus({
          type: "success",
          message: res.message,
        });
        if (onBackupRestored) {
          onBackupRestored();
        }
      } else {
        setBackupStatus({
          type: "error",
          message: res.message,
        });
      }
    } catch (err) {
      console.error(err);
      setBackupStatus({
        type: "error",
        message: "Ocurrió un error inesperado al importar el archivo.",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
          Configuración
        </h2>
        <p className="text-sm opacity-70 mt-1 text-slate-500">
          Personaliza tu experiencia de estudio, metas, copias de seguridad y preferencias en Frida
        </p>
      </div>

      {/* Mascot Card */}
      <div className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-purple-100">
        <FridaMascot mood="happy" size={88} />
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2 text-slate-800">
            <span>¡Hola! Soy Frida 🐾</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Tu compañera de estudio
            </span>
          </h3>
          <p className="text-xs opacity-75 max-w-lg leading-relaxed text-slate-600">
            Te acompaño en cada sesión para que recordar todo lo que estudias sea fácil, sin estrés y con la menor fricción posible.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Daily Goal Section */}
        <div className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-800">Meta Diaria de Repaso</h4>
              <p className="text-xs opacity-70 text-slate-500">
                Cantidad de tarjetas que te propones revisar cada día
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[10, 20, 30, 50].map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => onUpdatePreferences({ dailyGoal: goal })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  preferences.dailyGoal === goal
                    ? "bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:-translate-y-px"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
                }`}
              >
                {goal} tarjetas
              </button>
            ))}
          </div>
        </div>

        {/* Audio Effects Section */}
        <div className="bg-white rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
              {preferences.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-800">Efectos de Sonido</h4>
              <p className="text-xs opacity-70 text-slate-500">
                Campanillas suaves al calificar y fanfarria al completar una sesión
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
              preferences.soundEnabled
                ? "bg-purple-600 text-white border-transparent hover:bg-purple-700 hover:-translate-y-px shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {preferences.soundEnabled ? "Activados" : "Silenciados"}
          </button>
        </div>

        {/* Full Backup & Restore Section */}
        <div className="bg-white rounded-3xl p-6 space-y-4 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-800">Copia de Seguridad (Backup)</h4>
              <p className="text-xs opacity-70 text-slate-500">
                Guarda todas tus materias, unidades, tarjetas, rachas y configuración en un archivo para restaurarlo en tu portátil
              </p>
            </div>
          </div>

          {backupStatus.type && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                backupStatus.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {backupStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{backupStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Export Backup Button */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 text-left transition-all flex items-center gap-3.5 cursor-pointer disabled:opacity-50"
            >
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-800 block">
                  Exportar Backup Completo
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  Descarga un archivo .json con todos tus datos
                </span>
              </div>
            </button>

            {/* Import Backup Button */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                type="button"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-left transition-all flex items-center gap-3.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <Upload className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-800 block">
                    Restaurar / Importar Backup
                  </span>
                  <span className="text-xs text-slate-500 block truncate">
                    Carga un archivo .json para sincronizar datos
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & App info */}
        <div className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-75 shadow-sm border border-purple-100 text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Almacenamiento 100% privado y local en tu equipo (IndexedDB).</span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>para estudiar mejor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

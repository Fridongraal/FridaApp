import React, { useState, useEffect, useRef } from "react";
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
  Palette,
  Keyboard,
} from "lucide-react";
import type { UserPreferences, AppTheme, ClickSoundStyle } from "../types";
import { FridaMascot } from "./FridaMascot";
import { exportFullBackup, importFullBackup } from "../services/importExport";
import {
  playCardFlipSound,
  playRatingSound,
  playFridaBarkSound,
  playCelebrationFanfare,
  playButtonClickSound,
} from "../services/audio";

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

  const PRESET_GOALS = [10, 20, 30, 50];
  const isCustomGoal = !PRESET_GOALS.includes(preferences.dailyGoal);
  const [customGoalInput, setCustomGoalInput] = useState<string>(
    isCustomGoal ? String(preferences.dailyGoal) : ""
  );

  useEffect(() => {
    if (!PRESET_GOALS.includes(preferences.dailyGoal)) {
      setCustomGoalInput(String(preferences.dailyGoal));
    } else {
      setCustomGoalInput("");
    }
  }, [preferences.dailyGoal]);

  const handleSelectPreset = (goal: number) => {
    setCustomGoalInput("");
    onUpdatePreferences({ dailyGoal: goal });
  };

  const handleCustomGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomGoalInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 9999) {
      onUpdatePreferences({ dailyGoal: parsed });
    }
  };

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

      {/* Visual Theme Selector Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm border border-purple-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <span>Estilo Visual de la Interfaz</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  En tiempo real
                </span>
              </h3>
              <p className="text-xs opacity-70 text-slate-500">
                Elige la estética y personalidad de Frida que mejor se adapte a tu gusto
              </p>
            </div>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {[
            {
              id: "original" as AppTheme,
              title: "Frida Moderno",
              badge: "Lavanda Pastel",
              badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
              description: "Diseño minimalista con tonos lavanda suaves (#E6E6FA y #DCD0FF), bordes sutiles y tarjetas limpias.",
              icon: "💜",
              previewBg: "from-purple-100 via-purple-200 to-purple-50",
              sampleBtnText: "Repasar hoy",
              sampleBtnStyle: "bg-purple-600 text-white rounded-xl shadow-xs",
            },
            {
              id: "windows-95" as AppTheme,
              title: "Windows 95 Classic",
              badge: "Retro 1995",
              badgeColor: "bg-neutral-800 text-neutral-200 border-neutral-600",
              description: "Estética 1995: fondo verde azulado teal, ventanas biseladas en 3D, barras azul marino y fuente MS Sans Serif.",
              icon: "💾",
              previewBg: "from-[#008080] to-[#006666]",
              sampleBtnText: "Iniciar",
              sampleBtnStyle: "bg-[#c0c0c0] text-black border-t-2 border-l-2 border-white border-r-2 border-b-2 border-black font-bold shadow-none rounded-none",
            },
          ].map((themeOption) => {
            const isSelected = (preferences.theme || "original") === themeOption.id;
            return (
              <div
                key={themeOption.id}
                onClick={() => {
                  onUpdatePreferences({ theme: themeOption.id });
                  if (preferences.soundEnabled) {
                    playCardFlipSound(true);
                  }
                }}
                className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "border-purple-600 bg-purple-50/30 ring-2 ring-purple-300 shadow-md scale-101"
                    : "border-slate-200 hover:border-purple-300 bg-white hover:bg-slate-50/60"
                }`}
              >
                {/* Mini Preview Box */}
                <div
                  className={`w-full h-24 rounded-xl bg-gradient-to-br ${themeOption.previewBg} p-3 flex flex-col justify-between mb-3 relative overflow-hidden border border-white/60 shadow-inner`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xl">{themeOption.icon}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${themeOption.badgeColor}`}
                    >
                      {themeOption.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-center z-10">
                    <div
                      className={`px-3 py-1 text-[11px] font-bold ${themeOption.sampleBtnStyle} pointer-events-none`}
                    >
                      {themeOption.sampleBtnText}
                    </div>
                  </div>
                </div>

                {/* Theme Title & Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-sm text-slate-800">
                      {themeOption.title}
                    </h4>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 fill-purple-100" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {themeOption.description}
                  </p>
                </div>

                {/* Active Indicator Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    {isSelected ? "Activo ahora" : "Haz clic para activar"}
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-purple-600 bg-purple-600 ring-2 ring-purple-200"
                        : "border-slate-300 group-hover:border-purple-400"
                    }`}
                  />
                </div>
              </div>
            );
          })}
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

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => handleSelectPreset(goal)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  preferences.dailyGoal === goal && !customGoalInput
                    ? "bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:-translate-y-px"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
                }`}
              >
                {goal}
              </button>
            ))}

            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold pl-2">Personalizada:</span>
              <input
                type="number"
                min="1"
                max="999"
                value={customGoalInput}
                onChange={handleCustomGoalChange}
                placeholder={isCustomGoal ? String(preferences.dailyGoal) : "Ej: 25"}
                className={`w-16 px-2.5 py-1 text-xs font-extrabold rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  isCustomGoal || customGoalInput
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs placeholder-purple-200"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              />
              <span className="text-xs text-slate-500 font-medium pr-2">tarjetas</span>
            </div>
          </div>
        </div>

        {/* Audio Effects Section */}
        <div className="bg-white rounded-3xl p-6 space-y-4 shadow-sm border border-purple-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
                {preferences.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">Efectos de Sonido</h4>
                <p className="text-xs opacity-70 text-slate-500">
                  Giro táctil de carta, calificaciones 1-4, ladrido de Frida y fanfarria al terminar
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !preferences.soundEnabled;
                onUpdatePreferences({ soundEnabled: next });
                if (next) {
                  playRatingSound(3, true);
                }
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
                preferences.soundEnabled
                  ? "bg-purple-600 text-white border-transparent hover:bg-purple-700 hover:-translate-y-px shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {preferences.soundEnabled ? "Activados" : "Silenciados"}
            </button>
          </div>

          {/* Relaxing Button & Keyboard Clicks Configuration */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800">
                    Clics Táctiles de Teclado en Botones
                  </h5>
                  <p className="text-xs text-slate-500">
                    Reproduce un sonido relajante de pulsación mecánica al hacer clic en cualquier botón
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const current = preferences.buttonSoundEnabled !== false;
                  const next = !current;
                  onUpdatePreferences({ buttonSoundEnabled: next });
                  if (next) {
                    playButtonClickSound(preferences.clickSoundStyle || "keyboard-thock", true);
                  }
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border cursor-pointer shrink-0 ${
                  preferences.buttonSoundEnabled !== false
                    ? "bg-purple-600 text-white border-transparent hover:bg-purple-700 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {preferences.buttonSoundEnabled !== false ? "Activado" : "Desactivado"}
              </button>
            </div>

            {/* Click Sound Style Selector */}
            {preferences.buttonSoundEnabled !== false && (
              <div className="flex flex-wrap items-center gap-2 pl-9">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">
                  Estilo de pulsación:
                </span>
                {[
                  { id: "keyboard-thock" as ClickSoundStyle, label: "⌨️ Teclado Thock", desc: "Mecánico profundo y relajante" },
                  { id: "soft-click" as ClickSoundStyle, label: "🖱️ Clic Táctil", desc: "Suave y moderno" },
                  { id: "retro-switch" as ClickSoundStyle, label: "💾 Retro 90s", desc: "Interruptor clásico vintage" },
                  { id: "bubble-pop" as ClickSoundStyle, label: "🫧 Burbuja", desc: "Gota de agua y pop acuático suave" },
                ].map((styleOption) => {
                  const isSelected = (preferences.clickSoundStyle || "keyboard-thock") === styleOption.id;
                  return (
                    <button
                      key={styleOption.id}
                      type="button"
                      title={styleOption.desc}
                      onClick={() => {
                        onUpdatePreferences({ clickSoundStyle: styleOption.id });
                        playButtonClickSound(styleOption.id, true);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-purple-100 text-purple-800 border-purple-300 shadow-2xs scale-102"
                          : "bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-slate-200"
                      }`}
                    >
                      <span>{styleOption.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sound Preview Audition Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Probar sonido:</span>
            <button
              type="button"
              onClick={() => playButtonClickSound(preferences.clickSoundStyle || "keyboard-thock", true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer"
            >
              ⌨️ Clic Teclado
            </button>
            <button
              type="button"
              onClick={() => playCardFlipSound(true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/80 transition-colors cursor-pointer"
            >
              🃏 Volteo
            </button>
            <button
              type="button"
              onClick={() => playRatingSound(1, true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/80 transition-colors cursor-pointer"
            >
              ⭕ Otra vez
            </button>
            <button
              type="button"
              onClick={() => playRatingSound(2, true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 transition-colors cursor-pointer"
            >
              🟠 Difícil
            </button>
            <button
              type="button"
              onClick={() => playRatingSound(3, true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 transition-colors cursor-pointer"
            >
              🔵 Bien
            </button>
            <button
              type="button"
              onClick={() => playRatingSound(4, true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 transition-colors cursor-pointer"
            >
              🟢 Fácil
            </button>
            <button
              type="button"
              onClick={() => playFridaBarkSound(true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer"
            >
              🐾 Frida Guau
            </button>
            <button
              type="button"
              onClick={() => playCelebrationFanfare(true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
            >
              🎉 Fanfarria
            </button>
          </div>
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

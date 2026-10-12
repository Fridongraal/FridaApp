import type { ReviewRating } from "../types";
import { getUserPreferences } from "./db";

// Web Audio API synthesized sound cues for Frida
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function isAudioAllowed(override?: boolean): boolean {
  if (typeof override === "boolean") return override;
  try {
    return getUserPreferences().soundEnabled;
  } catch {
    return true;
  }
}

/**
 * Sonido táctil y suave de papel/giro al voltear una flashcard.
 */
export function playCardFlipSound(soundEnabled?: boolean) {
  if (!isAudioAllowed(soundEnabled)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Ruido blanco filtrado en paso banda para imitar el roce de papel
  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.07); // 70ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.06);
    filter.Q.value = 1.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.045, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  } catch {
    // Fallback silencioso si no soporta buffer creation
  }

  // Toque grave sutil tipo "whoosh"
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);

  oscGain.gain.setValueAtTime(0.035, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Sonido reactivo según la calificación asignada en la tarjeta:
 * 1 (Otra vez) -> Tono suave y calmado hacia abajo
 * 2 (Difícil)  -> Tono neutro tipo madera
 * 3 (Bien)     -> Campanilla cálida ascendente
 * 4 (Fácil)    -> Acorde brillante y cristalino
 */
export function playRatingSound(rating: ReviewRating, soundEnabled?: boolean) {
  if (!isAudioAllowed(soundEnabled)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (rating === 1) {
    // Otra vez: tono bajo calmado (sin estridencia, relajante)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);

    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (rating === 2) {
    // Difícil: toque neutro
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(370, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  } else if (rating === 3) {
    // Bien: 2 notas ascendentes alegres (C5 -> E5)
    const notes = [523.25, 659.25];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.065, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } else if (rating === 4) {
    // Fácil: arpegio cristalino y gratificante (D5 -> F#5 -> A5 -> D6)
    const notes = [587.33, 739.99, 880.0, 1174.66];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }
}

/**
 * Sonido tierno y juguetón cuando interactúas / haces clic sobre Frida.
 */
export function playFridaBarkSound(soundEnabled?: boolean) {
  if (!isAudioAllowed(soundEnabled)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Modulación tipo ladrido simpático / chirp juguetón
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.17);

  // Armónico superior sutil para darle brillo
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(640, now);
  osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(900, now + 0.15);

  gain2.gain.setValueAtTime(0.03, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.17);
}

/**
 * Fanfarria triunfal al completar la sesión de estudio.
 */
export function playCelebrationFanfare(soundEnabled?: boolean) {
  if (!isAudioAllowed(soundEnabled)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Secuencia victoriosa estilo fanfare
  const melody = [
    { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
    { freq: 659.25, time: 0.12, dur: 0.15 }, // E5
    { freq: 783.99, time: 0.24, dur: 0.15 }, // G5
    { freq: 1046.5, time: 0.36, dur: 0.45 }, // C6
    // Acorde brillante final al unísono
    { freq: 1318.51, time: 0.38, dur: 0.45 }, // E6
    { freq: 1567.98, time: 0.4, dur: 0.5 }, // G6
  ];

  melody.forEach((note) => {
    const t = ctx.currentTime + note.time;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note.freq, t);
    gain.gain.setValueAtTime(0.065, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + note.dur);
  });
}

/**
 * Sonido épico y triunfal de logro desbloqueado (estilo Minecraft / videojuego RPG).
 * Arpegio heroico ascendente con resonancia cristalina y acorde final sostenido.
 */
export function playAchievementSound(soundEnabled?: boolean) {
  if (!isAudioAllowed(soundEnabled)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Secuencia épica de notas: C4, E4, G4, C5, E5, G5, C6 (triunfo heroico)
  const fanfareNotes = [
    { freq: 261.63, time: 0.0, dur: 0.12, type: "triangle" as OscillatorType, vol: 0.09 }, // C4
    { freq: 329.63, time: 0.08, dur: 0.12, type: "triangle" as OscillatorType, vol: 0.09 }, // E4
    { freq: 392.0, time: 0.16, dur: 0.14, type: "triangle" as OscillatorType, vol: 0.1 }, // G4
    { freq: 523.25, time: 0.24, dur: 0.18, type: "sine" as OscillatorType, vol: 0.11 }, // C5
    { freq: 659.25, time: 0.32, dur: 0.22, type: "sine" as OscillatorType, vol: 0.12 }, // E5
    { freq: 783.99, time: 0.4, dur: 0.35, type: "sine" as OscillatorType, vol: 0.12 }, // G5
    { freq: 1046.5, time: 0.48, dur: 0.85, type: "sine" as OscillatorType, vol: 0.14 }, // C6
    { freq: 1318.51, time: 0.5, dur: 0.85, type: "sine" as OscillatorType, vol: 0.08 }, // E6
    { freq: 1567.98, time: 0.52, dur: 0.85, type: "sine" as OscillatorType, vol: 0.06 }, // G6
  ];

  fanfareNotes.forEach((n) => {
    const t = now + n.time;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = n.type;
    osc.frequency.setValueAtTime(n.freq, t);
    gain.gain.setValueAtTime(n.vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + n.dur);
  });

  // Impacto grave de logro
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = "sine";
  bass.frequency.setValueAtTime(130.81, now); // C3
  bass.frequency.exponentialRampToValueAtTime(65.4, now + 0.35); // C2
  bassGain.gain.setValueAtTime(0.12, now);
  bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  bass.connect(bassGain);
  bassGain.connect(ctx.destination);
  bass.start(now);
  bass.stop(now + 0.35);
}

/**
 * Compatibilidad hacia atrás con chime genérico
 */
export function playSuccessChime(soundEnabled?: boolean) {
  playRatingSound(3, soundEnabled);
}

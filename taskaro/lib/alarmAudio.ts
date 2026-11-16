// Web Audio API Synthesizer & Alarm Sound Engine
let audioCtx: AudioContext | null = null;
let soundInterval: any = null;
let htmlAudio: HTMLAudioElement | null = null;
let isPlaying = false;

// Safe AudioContext getter
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Unlock Audio on user gesture (click/touch/key)
export const unlockAudio = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  if (typeof window !== "undefined") {
    try {
      if (!htmlAudio) {
        htmlAudio = new Audio("/alarm.wav");
      }
      htmlAudio.volume = 0.01;
      htmlAudio
        .play()
        .then(() => {
          if (htmlAudio) {
            htmlAudio.pause();
            htmlAudio.currentTime = 0;
            htmlAudio.volume = 1;
          }
        })
        .catch(() => {});
    } catch {}
  }
};

// Play a single synthesized tone with ADSR envelope
const playTone = (
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  duration: number,
  volume = 0.5,
  startTime = 0
) => {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), ctx.currentTime + startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration + 0.05);
  } catch (e) {
    console.warn("Tone error:", e);
  }
};

// Play pattern based on sound profile
const triggerPattern = (
  soundType: "classic" | "gentle-chime" | "energetic" | "radar" = "classic",
  vol = 0.8
) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (soundType === "classic") {
    // Sharp digital clock beep-beep-beep
    playTone(ctx, 880, "square", 0.12, vol * 0.4, 0);
    playTone(ctx, 880, "square", 0.12, vol * 0.4, 0.16);
    playTone(ctx, 880, "square", 0.12, vol * 0.4, 0.32);
    playTone(ctx, 1100, "square", 0.18, vol * 0.45, 0.48);
  } else if (soundType === "gentle-chime") {
    // Soothing chime arpeggio
    playTone(ctx, 523.25, "sine", 0.4, vol * 0.35, 0); // C5
    playTone(ctx, 659.25, "sine", 0.4, vol * 0.35, 0.15); // E5
    playTone(ctx, 783.99, "sine", 0.5, vol * 0.4, 0.3); // G5
    playTone(ctx, 1046.5, "sine", 0.6, vol * 0.45, 0.45); // C6
  } else if (soundType === "energetic") {
    // Fast pulsing melody
    playTone(ctx, 440, "triangle", 0.1, vol * 0.4, 0);
    playTone(ctx, 554.37, "triangle", 0.1, vol * 0.4, 0.12);
    playTone(ctx, 659.25, "triangle", 0.1, vol * 0.4, 0.24);
    playTone(ctx, 880, "triangle", 0.2, vol * 0.5, 0.36);
  } else if (soundType === "radar") {
    // Sonar ping
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  }
};

/**
 * START CONTINUOUS ALARM SOUND
 */
export const startAlarmSound = (
  soundType: "classic" | "gentle-chime" | "energetic" | "radar" = "classic",
  targetVolume = 80,
  gradualVolume = true
) => {
  stopAlarmSound();
  isPlaying = true;

  const normalizedVol = Math.max(0.1, Math.min(1, targetVolume / 100));
  let currentVol = gradualVolume ? 0.15 : normalizedVol;

  // Immediate first play
  triggerPattern(soundType, currentVol);

  // Fallback html5 audio loop
  try {
    if (!htmlAudio) {
      htmlAudio = new Audio("/alarm.wav");
    }
    htmlAudio.loop = true;
    htmlAudio.volume = currentVol;
    htmlAudio.play().catch(() => {});
  } catch {}

  // Interval to repeat pattern every 1.1s
  soundInterval = setInterval(() => {
    if (!isPlaying) return;

    if (gradualVolume && currentVol < normalizedVol) {
      currentVol = Math.min(normalizedVol, currentVol + 0.05);
      if (htmlAudio) htmlAudio.volume = currentVol;
    }

    triggerPattern(soundType, currentVol);
  }, 1100);
};

/**
 * STOP ALARM SOUND
 */
export const stopAlarmSound = () => {
  isPlaying = false;
  if (soundInterval) {
    clearInterval(soundInterval);
    soundInterval = null;
  }
  if (htmlAudio) {
    try {
      htmlAudio.pause();
      htmlAudio.currentTime = 0;
    } catch {}
  }
};

/**
 * PREVIEW / TEST SOUND (Plays 3 seconds)
 */
export const previewAlarmSound = (
  soundType: "classic" | "gentle-chime" | "energetic" | "radar" = "gentle-chime"
) => {
  unlockAudio();
  stopAlarmSound();

  triggerPattern(soundType, 0.7);

  const previewInterval = setInterval(() => {
    triggerPattern(soundType, 0.7);
  }, 1000);

  setTimeout(() => {
    clearInterval(previewInterval);
  }, 3200);
};

// =============================================================================
// BAAJIT SOUNDS — Nature-themed audio feedback
// Uses Web Audio API to generate sounds without external files
// =============================================================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// --- Bird Chirp (task complete, habit check-off) ---
export function playChirp() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two-note chirp
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(1800 + i * 400, now + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(2400 + i * 300, now + i * 0.1 + 0.06);
      osc.frequency.exponentialRampToValueAtTime(1600 + i * 200, now + i * 0.1 + 0.12);

      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.18);
    }
  } catch {}
}

// --- Water Drop (mood logged, brain dump saved) ---
export function playWaterDrop() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {}
}

// --- Leaf Rustle (navigation, page transition) ---
export function playRustle() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Soft filtered noise burst
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3000, now);
    filter.Q.setValueAtTime(0.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + 0.2);
  } catch {}
}

// --- Celebration (streak milestone, level up) ---
export function playCelebration() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Ascending three-note bird song
    const notes = [1200, 1500, 1900];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + i * 0.12 + 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.07, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.2);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.25);
    });
  } catch {}
}

// --- Gentle Chime (energy check-in, timer start) ---
export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch {}
}

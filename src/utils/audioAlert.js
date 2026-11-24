/**
 * Safe Web Audio API Chime for New Order Alerts
 * Generates a short, pleasant counter chime without external audio files.
 * Browser-permission safe: will not crash or throw if audio context is blocked.
 */

let audioCtx = null;
let soundEnabled = true;

try {
  const saved = localStorage.getItem('nr_admin_sound_alert');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch {
  soundEnabled = true;
}

export const isSoundEnabled = () => soundEnabled;

export const toggleSoundEnabled = () => {
  soundEnabled = !soundEnabled;
  try {
    localStorage.setItem('nr_admin_sound_alert', soundEnabled ? 'true' : 'false');
  } catch (e) {
    console.warn(e);
  }
  return soundEnabled;
};

export const playNewOrderChime = () => {
  if (!soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Note 1: High tone (880Hz - A5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: Higher harmonizing tone (1318.5Hz - E6)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    // Audio autoplay blocked or unsupported - fail silently
    console.debug('Audio chime skipped (user interaction required):', err);
  }
};

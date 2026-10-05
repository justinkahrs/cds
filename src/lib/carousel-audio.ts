const TICK_DURATION = 0.015;
const TICK_LEVEL = 0.028;
const TICK_INTERVAL = 0.05;

/** Quiet mechanical feedback, with no queued sounds or dependency on audio access. */
export function createCarouselAudio() {
  let context: AudioContext | undefined;
  let buffer: AudioBuffer | undefined;
  let resuming = false;
  let lastTick = -Infinity;

  const unlock = () => {
    if (document.hidden || typeof AudioContext === 'undefined') return;
    try {
      if (!context || context.state === 'closed') {
        context = new AudioContext({ latencyHint: 'interactive' });
        buffer = undefined;
        lastTick = -Infinity;
      }
      if (context.state !== 'running' && !resuming) {
        resuming = true;
        void context.resume().catch(() => {}).finally(() => { resuming = false; });
      }
    } catch { resuming = false; /* Browsing works even when audio is unavailable. */ }
  };

  const tick = () => {
    if (document.hidden || !context || context.state !== 'running') return;
    const now = context.currentTime;
    if (now - lastTick < TICK_INTERVAL) return;
    let source: AudioBufferSourceNode | undefined;
    try {
      if (!buffer) {
        buffer = context.createBuffer(1, Math.ceil(context.sampleRate * TICK_DURATION), context.sampleRate);
        const samples = buffer.getChannelData(0);
        let previousNoise = 0;
        for (let i = 0; i < samples.length; i++) {
          const time = i / context.sampleRate;
          const noise = Math.random() * 2 - 1;
          // A softened, damped detent with a little texture and no ringing tail.
          const envelope = Math.min(1, time / 0.0007) * Math.exp(-time / 0.0025)
            * Math.min(1, (samples.length - 1 - i) / (context.sampleRate * 0.002));
          samples[i] = TICK_LEVEL * envelope * (0.8 * Math.sin(2 * Math.PI * 1800 * time) + 0.1 * (noise - previousNoise));
          previousNoise = noise;
        }
      }
      const voice = context.createBufferSource();
      source = voice;
      voice.buffer = buffer;
      voice.connect(context.destination);
      voice.onended = () => voice.disconnect();
      voice.start(now);
      lastTick = now;
    } catch { source?.disconnect(); /* Failed ticks are discarded, never replayed. */ }
  };

  return { unlock, tick };
}

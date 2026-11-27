export type AudioMode = 'off' | 'tone';

export interface AudioMetrics {
  level: number;
  bass: number;
  beat: number;
  spectrum: number[];
}

const PENTATONIC_HZ = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

// Chord progressions shift every 10 floors so the soundtrack evolves with tower height
const STAGE_PROGRESSIONS = [
  { bass: [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 98.0, 77.78], arp: [261.63, 311.13, 392.0, 523.25, 392.0, 311.13, 466.16, 392.0] },
  { bass: [73.42, 73.42, 87.31, 73.42, 98.0, 73.42, 110.0, 87.31], arp: [293.66, 349.23, 440.0, 587.33, 440.0, 349.23, 523.25, 440.0] },
  { bass: [82.41, 82.41, 98.0, 82.41, 110.0, 82.41, 123.47, 98.0], arp: [329.63, 392.0, 493.88, 659.25, 493.88, 392.0, 587.33, 493.88] }
];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;

  private toneTimer: number | null = null;
  private toneBus: GainNode | null = null;
  private toneStep = 0;
  private towerStage = 0;

  public mode: AudioMode = 'off';
  public sfxEnabled = true;

  private smoothLevel = 0;
  private smoothBass = 0;
  private prevBass = 0;
  private beatPulse = 0;
  private readonly spectrumBins = new Array<number>(28).fill(0);

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.72;
      this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
    }
    return this.ctx;
  }

  public setTowerLevel(level: number): void {
    this.towerStage = Math.floor(level / 10) % STAGE_PROGRESSIONS.length;
  }

  public enableTestTone(): void {
    this.stopSource();
    const ctx = this.ensureContext();

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.45, ctx.currentTime);
    bus.connect(this.analyser!);
    bus.connect(ctx.destination);
    this.toneBus = bus;
    this.toneStep = 0;
    this.mode = 'tone';

    const stepMs = 125;
    this.triggerGrooveStep(ctx, bus, this.toneStep++);
    this.toneTimer = window.setInterval(() => {
      if (this.mode !== 'tone' || !this.ctx || !this.toneBus) return;
      this.triggerGrooveStep(this.ctx, this.toneBus, this.toneStep++);
    }, stepMs);
  }

  private triggerGrooveStep(ctx: AudioContext, bus: GainNode, step: number): void {
    const now = ctx.currentTime;
    const eighth = step % 2 === 0;
    const quarter = step % 4 === 0;
    const prog = STAGE_PROGRESSIONS[this.towerStage];

    if (quarter) {
      const kickOsc = ctx.createOscillator();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(148, now);
      kickOsc.frequency.exponentialRampToValueAtTime(44, now + 0.11);

      const kickGain = ctx.createGain();
      kickGain.gain.setValueAtTime(0.44, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      kickOsc.connect(kickGain);
      kickGain.connect(bus);
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);
    }

    if (eighth) {
      const bassFreq = prog.bass[Math.floor(step / 2) % prog.bass.length];
      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700 + this.towerStage * 120, now);
      filter.frequency.exponentialRampToValueAtTime(185, now + 0.19);
      filter.Q.setValueAtTime(3.2, now);

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.16, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(bus);
      bassOsc.start(now);
      bassOsc.stop(now + 0.21);
    }

    if (step % 4 === 2) {
      const hatOsc = ctx.createOscillator();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(6400, now);

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(4400, now);

      const hatGain = ctx.createGain();
      hatGain.gain.setValueAtTime(0.042, now);
      hatGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);

      hatOsc.connect(hp);
      hp.connect(hatGain);
      hatGain.connect(bus);
      hatOsc.start(now);
      hatOsc.stop(now + 0.05);
    }

    if (step % 2 === 1) {
      const arpFreq = prog.arp[Math.floor(step / 2) % prog.arp.length];
      const arpOsc = ctx.createOscillator();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(arpFreq, now);

      const arpGain = ctx.createGain();
      arpGain.gain.setValueAtTime(0.06, now);
      arpGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);

      arpOsc.connect(arpGain);
      arpGain.connect(bus);
      arpOsc.start(now);
      arpOsc.stop(now + 0.15);
    }
  }

  public stopSource(): void {
    if (this.toneTimer !== null) {
      window.clearInterval(this.toneTimer);
      this.toneTimer = null;
    }
    if (this.toneBus) {
      this.toneBus.disconnect();
      this.toneBus = null;
    }
    this.mode = 'off';
  }

  public sample(): AudioMetrics {
    if (this.mode === 'off' || !this.analyser || !this.freqData) {
      this.smoothLevel *= 0.86;
      this.smoothBass *= 0.86;
      this.beatPulse *= 0.82;
      for (let i = 0; i < this.spectrumBins.length; i++) {
        this.spectrumBins[i] *= 0.85;
      }
      return {
        level: this.smoothLevel,
        bass: this.smoothBass,
        beat: this.beatPulse,
        spectrum: this.spectrumBins
      };
    }

    this.analyser.getByteFrequencyData(this.freqData);

    const len = this.freqData.length;
    let total = 0;
    let bassSum = 0;
    const bassCount = Math.max(4, Math.floor(len * 0.12));

    for (let i = 0; i < len; i++) {
      const v = this.freqData[i] / 255;
      total += v;
      if (i < bassCount) {
        bassSum += v;
      }
    }

    const rawLevel = Math.min(1, (total / len) * 2.4);
    const rawBass = Math.min(1, (bassSum / bassCount) * 1.45);

    this.smoothLevel += (rawLevel - this.smoothLevel) * 0.3;
    this.smoothBass += (rawBass - this.smoothBass) * 0.34;

    const bassRise = rawBass - this.prevBass;
    this.prevBass = rawBass;
    if (bassRise > 0.085 && rawBass > 0.28) {
      this.beatPulse = 1;
    } else {
      this.beatPulse *= 0.86;
    }

    const bins = this.spectrumBins.length;
    const step = Math.max(1, Math.floor((len * 0.62) / bins));
    for (let b = 0; b < bins; b++) {
      let sum = 0;
      const start = b * step;
      for (let j = 0; j < step; j++) {
        sum += (this.freqData[start + j] ?? 0) / 255;
      }
      const target = Math.min(1, (sum / step) * 1.35);
      this.spectrumBins[b] += (target - this.spectrumBins[b]) * 0.35;
    }

    return {
      level: this.smoothLevel,
      bass: this.smoothBass,
      beat: this.beatPulse,
      spectrum: this.spectrumBins
    };
  }

  public playDrop(perfect: boolean, streak: number, widthRatio: number): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    if (perfect) {
      const noteIdx = Math.min(PENTATONIC_HZ.length - 1, Math.max(0, streak - 1));
      const freq = PENTATONIC_HZ[noteIdx];

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const overtone = ctx.createOscillator();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * (streak >= 4 ? 1.5 : 2), now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

      const overGain = ctx.createGain();
      overGain.gain.setValueAtTime(0.065, now);
      overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      osc.connect(gain);
      overtone.connect(overGain);
      overGain.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 0.38);
      overtone.stop(now + 0.25);
      return;
    }

    const baseFreq = 165 + (1 - widthRatio) * 180;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(58, baseFreq * 0.42), now + 0.11);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playNewBest(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.055;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.1, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  public playGameOver(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(185, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.48);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(460, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);
  }
}

export type AudioMode = 'off' | 'tone';

export interface AudioMetrics {
  level: number;
  bass: number;
  beat: number;
  beatPhase: number;
  onBeat: boolean;
  spectrum: number[];
}

export interface TrackInfo {
  index: number;
  total: number;
  name: string;
  bpm: number;
}

interface TrackPreset {
  name: string;
  bpm: number;
  bassWave: OscillatorType;
  leadWave: OscillatorType;
  filterBase: number;
  kickFreq: number;
  bassNotes: number[];
  leadNotes: number[];
  hatPattern: number[];
}

const PENTATONIC_HZ = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

export const TRACKS: TrackPreset[] = [
  {
    name: 'Midnight Pulse',
    bpm: 118,
    bassWave: 'sawtooth',
    leadWave: 'triangle',
    filterBase: 640,
    kickFreq: 145,
    bassNotes: [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 98.0, 77.78],
    leadNotes: [261.63, 311.13, 392.0, 523.25, 392.0, 311.13, 466.16, 392.0],
    hatPattern: [0, 0, 1, 0, 0, 0, 1, 1]
  },
  {
    name: 'Neon Skyline',
    bpm: 124,
    bassWave: 'sawtooth',
    leadWave: 'sine',
    filterBase: 760,
    kickFreq: 155,
    bassNotes: [73.42, 73.42, 87.31, 98.0, 73.42, 110.0, 98.0, 87.31],
    leadNotes: [293.66, 440.0, 523.25, 587.33, 440.0, 349.23, 523.25, 440.0],
    hatPattern: [0, 1, 1, 0, 0, 1, 1, 0]
  },
  {
    name: 'Deep Horizon',
    bpm: 108,
    bassWave: 'triangle',
    leadWave: 'sine',
    filterBase: 480,
    kickFreq: 125,
    bassNotes: [55.0, 55.0, 65.41, 55.0, 73.42, 55.0, 82.41, 65.41],
    leadNotes: [220.0, 261.63, 329.63, 392.0, 329.63, 261.63, 440.0, 329.63],
    hatPattern: [0, 0, 1, 0, 0, 0, 1, 0]
  },
  {
    name: 'Cyber Arp',
    bpm: 128,
    bassWave: 'square',
    leadWave: 'sawtooth',
    filterBase: 860,
    kickFreq: 165,
    bassNotes: [82.41, 82.41, 98.0, 82.41, 110.0, 98.0, 123.47, 98.0],
    leadNotes: [329.63, 493.88, 659.25, 587.33, 493.88, 392.0, 587.33, 493.88],
    hatPattern: [1, 0, 1, 0, 1, 0, 1, 1]
  },
  {
    name: 'Velvet Drift',
    bpm: 96,
    bassWave: 'triangle',
    leadWave: 'triangle',
    filterBase: 420,
    kickFreq: 118,
    bassNotes: [61.74, 61.74, 73.42, 61.74, 82.41, 73.42, 92.5, 73.42],
    leadNotes: [246.94, 293.66, 369.99, 440.0, 369.99, 293.66, 329.63, 293.66],
    hatPattern: [0, 0, 1, 0, 0, 1, 0, 0]
  },
  {
    name: 'Acid Orbit',
    bpm: 132,
    bassWave: 'sawtooth',
    leadWave: 'square',
    filterBase: 940,
    kickFreq: 170,
    bassNotes: [65.41, 98.0, 65.41, 130.81, 65.41, 116.54, 98.0, 77.78],
    leadNotes: [261.63, 392.0, 523.25, 392.0, 466.16, 392.0, 622.25, 523.25],
    hatPattern: [0, 1, 1, 1, 0, 1, 1, 1]
  },
  {
    name: 'Solaris Chord',
    bpm: 114,
    bassWave: 'sine',
    leadWave: 'triangle',
    filterBase: 580,
    kickFreq: 138,
    bassNotes: [69.3, 69.3, 82.41, 92.5, 69.3, 103.83, 92.5, 82.41],
    leadNotes: [277.18, 349.23, 415.3, 554.37, 415.3, 349.23, 493.88, 415.3],
    hatPattern: [0, 0, 1, 0, 0, 1, 1, 0]
  },
  {
    name: 'Subway Echo',
    bpm: 122,
    bassWave: 'square',
    leadWave: 'sine',
    filterBase: 620,
    kickFreq: 150,
    bassNotes: [58.27, 58.27, 69.3, 58.27, 77.78, 69.3, 87.31, 69.3],
    leadNotes: [233.08, 349.23, 466.16, 349.23, 311.13, 233.08, 392.0, 349.23],
    hatPattern: [0, 1, 1, 0, 1, 0, 1, 0]
  },
  {
    name: 'Chrome Runner',
    bpm: 136,
    bassWave: 'sawtooth',
    leadWave: 'triangle',
    filterBase: 880,
    kickFreq: 174,
    bassNotes: [73.42, 110.0, 73.42, 146.83, 87.31, 110.0, 98.0, 130.81],
    leadNotes: [293.66, 440.0, 587.33, 659.25, 587.33, 440.0, 523.25, 440.0],
    hatPattern: [1, 0, 1, 1, 1, 0, 1, 1]
  },
  {
    name: 'Zenith Glow',
    bpm: 120,
    bassWave: 'triangle',
    leadWave: 'sine',
    filterBase: 700,
    kickFreq: 148,
    bassNotes: [65.41, 82.41, 98.0, 82.41, 73.42, 87.31, 110.0, 98.0],
    leadNotes: [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 493.88, 392.0],
    hatPattern: [0, 0, 1, 0, 1, 0, 1, 0]
  }
];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;

  private schedulerTimer: number | null = null;
  private toneBus: GainNode | null = null;
  private speakerGain: GainNode | null = null;

  private nextNoteTime = 0;
  private beatOriginTime = 0;
  private currentStep = 0;
  private trackIndex = 0;
  private towerTranspose = 1;

  public mode: AudioMode = 'off';
  public sfxEnabled = true;

  private smoothLevel = 0;
  private smoothBass = 0;
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
    if (!this.speakerGain) {
      this.speakerGain = this.ctx.createGain();
      this.speakerGain.gain.setValueAtTime(this.sfxEnabled ? 1 : 0, this.ctx.currentTime);
      this.speakerGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    if (this.ctx && this.speakerGain) {
      this.speakerGain.gain.setTargetAtTime(enabled ? 1 : 0, this.ctx.currentTime, 0.015);
    }
  }

  public setTowerLevel(level: number): void {
    const stage = Math.floor(level / 10) % 3;
    this.towerTranspose = stage === 0 ? 1 : stage === 1 ? 1.12246 : 1.25992; // +0, +2, +4 semitones
  }

  public getTrackInfo(): TrackInfo {
    const track = TRACKS[this.trackIndex];
    return {
      index: this.trackIndex,
      total: TRACKS.length,
      name: track.name,
      bpm: track.bpm
    };
  }

  public nextTrack(): TrackInfo {
    this.trackIndex = (this.trackIndex + 1) % TRACKS.length;
    if (this.mode === 'tone' && this.ctx) {
      this.beatOriginTime = this.ctx.currentTime;
      this.nextNoteTime = this.ctx.currentTime;
      this.currentStep = 0;
    }
    return this.getTrackInfo();
  }

  public enableTestTone(): void {
    this.stopSource();
    const ctx = this.ensureContext();

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.45, ctx.currentTime);
    bus.connect(this.analyser!);
    bus.connect(this.speakerGain!);
    this.toneBus = bus;

    this.currentStep = 0;
    this.beatOriginTime = ctx.currentTime + 0.02;
    this.nextNoteTime = this.beatOriginTime;
    this.mode = 'tone';

    // Lookahead scheduler keeps WebAudio timing sample-accurate
    this.scheduleAhead();
    this.schedulerTimer = window.setInterval(() => {
      this.scheduleAhead();
    }, 25);
  }

  private scheduleAhead(): void {
    if (this.mode !== 'tone' || !this.ctx || !this.toneBus) return;
    const lookaheadSec = 0.11;
    const track = TRACKS[this.trackIndex];
    const sixteenthSec = 60 / track.bpm / 4;

    while (this.nextNoteTime < this.ctx.currentTime + lookaheadSec) {
      this.scheduleStep(this.ctx, this.toneBus, track, this.currentStep, this.nextNoteTime);
      this.nextNoteTime += sixteenthSec;
      this.currentStep += 1;
    }
  }

  private scheduleStep(
    ctx: AudioContext,
    bus: GainNode,
    track: TrackPreset,
    step: number,
    time: number
  ): void {
    const quarter = step % 4 === 0;
    const eighth = step % 2 === 0;
    const tr = this.towerTranspose;

    // Kick on every quarter beat
    if (quarter) {
      const kickOsc = ctx.createOscillator();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(track.kickFreq, time);
      kickOsc.frequency.exponentialRampToValueAtTime(42, time + 0.11);

      const kickGain = ctx.createGain();
      kickGain.gain.setValueAtTime(0.44, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      kickOsc.connect(kickGain);
      kickGain.connect(bus);
      kickOsc.start(time);
      kickOsc.stop(time + 0.2);
    }

    // Bassline on 8th notes
    if (eighth) {
      const idx = Math.floor(step / 2) % track.bassNotes.length;
      const bassFreq = track.bassNotes[idx] * tr;
      const bassOsc = ctx.createOscillator();
      bassOsc.type = track.bassWave;
      bassOsc.frequency.setValueAtTime(bassFreq, time);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track.filterBase, time);
      filter.frequency.exponentialRampToValueAtTime(175, time + 0.18);
      filter.Q.setValueAtTime(3.0, time);

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.15, time);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.19);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(bus);
      bassOsc.start(time);
      bassOsc.stop(time + 0.2);
    }

    // Hi-hat pattern
    if (track.hatPattern[step % track.hatPattern.length]) {
      const hatOsc = ctx.createOscillator();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(6400, time);

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(4400, time);

      const hatGain = ctx.createGain();
      hatGain.gain.setValueAtTime(0.04, time);
      hatGain.gain.exponentialRampToValueAtTime(0.0005, time + 0.042);

      hatOsc.connect(hp);
      hp.connect(hatGain);
      hatGain.connect(bus);
      hatOsc.start(time);
      hatOsc.stop(time + 0.05);
    }

    // Melodic lead / arp on off-beats
    if (step % 2 === 1) {
      const idx = Math.floor(step / 2) % track.leadNotes.length;
      const leadFreq = track.leadNotes[idx] * tr;
      const leadOsc = ctx.createOscillator();
      leadOsc.type = track.leadWave;
      leadOsc.frequency.setValueAtTime(leadFreq, time);

      const leadGain = ctx.createGain();
      leadGain.gain.setValueAtTime(0.055, time);
      leadGain.gain.exponentialRampToValueAtTime(0.0008, time + 0.14);

      leadOsc.connect(leadGain);
      leadGain.connect(bus);
      leadOsc.start(time);
      leadOsc.stop(time + 0.15);
    }
  }

  public stopSource(): void {
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.toneBus) {
      this.toneBus.disconnect();
      this.toneBus = null;
    }
    this.mode = 'off';
  }

  public sample(): AudioMetrics {
    if (this.mode === 'off' || !this.analyser || !this.freqData || !this.ctx) {
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
        beatPhase: 0,
        onBeat: false,
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

    // Sample-accurate beat phase derived directly from AudioContext clock & track BPM
    const track = TRACKS[this.trackIndex];
    const beatsElapsed = Math.max(0, (this.ctx.currentTime - this.beatOriginTime) * (track.bpm / 60));
    const beatPhase = beatsElapsed % 1;
    // Exact beat pulse: peaks at 1.0 right on the kick (phase 0) and decays smoothly
    this.beatPulse = Math.max(0, 1 - beatPhase * 2.4);
    // Fair, rhythmic ON BEAT window centered on each quarter-note kick
    const onBeat = beatPhase <= 0.24 || beatPhase >= 0.88;

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
      beatPhase,
      onBeat,
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
      gain.connect(this.speakerGain!);

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
    gain.connect(this.speakerGain!);
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
      gain.connect(this.speakerGain!);
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
    gain.connect(this.speakerGain!);

    osc.start(now);
    osc.stop(now + 0.52);
  }
}

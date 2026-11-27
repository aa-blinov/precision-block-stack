import type { AudioEngine, AudioMetrics } from './audio';

export type GamePhase = 'ready' | 'playing' | 'gameover';

export interface GameSnapshot {
  phase: GamePhase;
  score: number;
  best: number;
  streak: number;
  maxStreak: number;
  widthPct: number;
  accuracyPct: number;
}

interface Slab {
  x: number;
  y: number;
  width: number;
  hue: number;
  perfectFlash: number;
}

interface FallingPiece {
  x: number;
  y: number;
  width: number;
  hue: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  alpha: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface Shockwave {
  x: number;
  y: number;
  width: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface FloatingCallout {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface BgParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

const BEST_STORAGE_KEY = 'precision-block-stack:best';
const BEST_HEIGHT_KEY = 'precision-block-stack:best-height';
const SLAB_HEIGHT = 24;
const DEPTH_Y = 7;
const PERFECT_TOLERANCE_PX = 5.2;

export class PrecisionStackGame {
  private readonly ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private phase: GamePhase = 'ready';
  private baseWidth = 220;
  private stack: Slab[] = [];
  private active: { x: number; y: number; width: number; dir: 1 | -1; speed: number; hue: number } | null = null;
  private falling: FallingPiece[] = [];
  private sparks: Spark[] = [];
  private waves: Shockwave[] = [];
  private callouts: FloatingCallout[] = [];
  private bgParticles: BgParticle[] = [];

  private score = 0;
  private best = 0;
  private bestHeightFloors = 0;
  private passedBestLine = false;
  private streak = 0;
  private maxStreak = 0;
  private totalDrops = 0;
  private perfectDrops = 0;

  private cameraY = 0;
  private targetCameraY = 0;
  private towerBounce = 0;
  private shakeIntensity = 0;
  private pulseGlow = 0;
  private hitStopTimer = 0;
  private lastTime = 0;
  private rafId = 0;

  private audioMetrics: AudioMetrics = {
    level: 0,
    bass: 0,
    beat: 0,
    beatPhase: 0,
    onBeat: false,
    spectrum: []
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly audio: AudioEngine,
    private readonly onSnapshot: (snap: GameSnapshot) => void,
    private readonly onMeter: (level: number) => void
  ) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context unavailable');
    }
    this.ctx = context;
    this.best = this.loadInt(BEST_STORAGE_KEY);
    this.bestHeightFloors = this.loadInt(BEST_HEIGHT_KEY);
    this.resize();
    this.initBgParticles();
    this.setupDemoTower();
  }

  private loadInt(key: string): number {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch {
      return 0;
    }
  }

  private saveInt(key: string, value: number): void {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // Ignore storage failures
    }
  }

  private initBgParticles(): void {
    this.bgParticles = Array.from({ length: 34 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 1.8,
      speed: 0.015 + Math.random() * 0.035,
      alpha: 0.14 + Math.random() * 0.35
    }));
  }

  public resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(320, rect.width);
    this.height = Math.max(400, rect.height);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.phase === 'ready') {
      this.baseWidth = Math.min(230, Math.round(this.width * 0.54));
      this.setupDemoTower();
    }
  }

  private setupDemoTower(): void {
    this.stack = [
      { x: 0, y: 0, width: this.baseWidth, hue: 196, perfectFlash: 0 },
      { x: 0, y: SLAB_HEIGHT, width: this.baseWidth * 0.92, hue: 208, perfectFlash: 0 },
      { x: 0, y: SLAB_HEIGHT * 2, width: this.baseWidth * 0.84, hue: 220, perfectFlash: 0 }
    ];
    this.active = null;
    this.falling = [];
    this.sparks = [];
    this.waves = [];
    this.callouts = [];
    this.cameraY = 0;
    this.targetCameraY = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.totalDrops = 0;
    this.perfectDrops = 0;
    this.audio.setTowerLevel(0);
    this.emitSnapshot();
  }

  public start(): void {
    this.baseWidth = Math.min(230, Math.round(this.width * 0.54));
    this.stack = [{ x: 0, y: 0, width: this.baseWidth, hue: 196, perfectFlash: 0 }];
    this.falling = [];
    this.sparks = [];
    this.waves = [];
    this.callouts = [];
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.totalDrops = 0;
    this.perfectDrops = 0;
    this.passedBestLine = this.bestHeightFloors === 0;
    this.cameraY = 0;
    this.targetCameraY = 0;
    this.towerBounce = 0;
    this.shakeIntensity = 0;
    this.hitStopTimer = 0;
    this.phase = 'playing';
    this.audio.setTowerLevel(0);
    this.spawnNextSlab();
    this.emitSnapshot();
  }

  private spawnNextSlab(): void {
    const top = this.stack[this.stack.length - 1];
    const levelIndex = this.stack.length;
    this.audio.setTowerLevel(levelIndex);

    const dir: 1 | -1 = levelIndex % 2 === 1 ? 1 : -1;
    const travelMargin = Math.max(100, this.baseWidth * 0.74);
    const startX = -dir * (top.width * 0.5 + travelMargin);
    const speed = Math.min(520, 235 + levelIndex * 6.8);
    const hue = (196 + levelIndex * 11) % 360;

    this.active = {
      x: startX,
      y: top.y + SLAB_HEIGHT,
      width: top.width,
      dir,
      speed,
      hue
    };

    this.targetCameraY = Math.max(0, (this.stack.length - 5) * SLAB_HEIGHT);
  }

  public drop(): void {
    if (this.phase !== 'playing' || !this.active) return;

    const current = this.active;
    const prev = this.stack[this.stack.length - 1];
    const delta = current.x - prev.x;
    const onBeat = this.audio.mode !== 'off' && this.audioMetrics.onBeat;

    this.totalDrops += 1;

    // Perfect alignment
    if (Math.abs(delta) <= PERFECT_TOLERANCE_PX) {
      this.perfectDrops += 1;
      this.streak += 1;
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
      }

      let nextWidth = current.width;
      if (this.streak >= 4 && nextWidth < this.baseWidth) {
        nextWidth = Math.min(this.baseWidth, nextWidth + 10);
      }

      this.stack.push({
        x: prev.x,
        y: current.y,
        width: nextWidth,
        hue: current.hue,
        perfectFlash: 1
      });

      const feverMult = this.streak >= 5 ? 2 : 1;
      const points = (onBeat ? 2 : 1) * feverMult;
      this.score += points;
      this.pulseGlow = 1;
      this.towerBounce = 6.5;
      this.shakeIntensity = this.streak >= 3 ? 4.5 : 3.2;
      if (this.streak >= 3) {
        this.hitStopTimer = 0.028;
      }

      this.waves.push({
        x: prev.x,
        y: current.y,
        width: nextWidth,
        hue: current.hue,
        life: 0,
        maxLife: 0.45
      });

      this.spawnSparks(prev.x, current.y, nextWidth, current.hue, 26);

      const parts = [this.streak >= 2 ? `PERFECT ×${this.streak}` : 'PERFECT'];
      if (onBeat) parts.push('ON BEAT');
      if (points > 1) parts.push(`+${points}`);

      this.callouts.push({
        x: prev.x,
        y: current.y + SLAB_HEIGHT + 12,
        text: parts.join(' '),
        color: this.streak >= 4 ? '#fbbf24' : '#34d399',
        life: 0,
        maxLife: 0.9
      });

      this.audio.playDrop(true, this.streak, nextWidth / this.baseWidth);
      this.checkMilestones(current.y);
      this.spawnNextSlab();
      this.emitSnapshot();
      return;
    }

    // Overlap calculation
    const prevLeft = prev.x - prev.width / 2;
    const prevRight = prev.x + prev.width / 2;
    const currLeft = current.x - current.width / 2;
    const currRight = current.x + current.width / 2;

    const overlapLeft = Math.max(prevLeft, currLeft);
    const overlapRight = Math.min(prevRight, currRight);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0.5) {
      this.falling.push({
        x: current.x,
        y: current.y,
        width: current.width,
        hue: current.hue,
        vx: current.dir * 45,
        vy: -20,
        angle: 0,
        vAngle: current.dir * 2.2,
        alpha: 1
      });
      this.active = null;
      this.phase = 'gameover';
      this.streak = 0;
      this.shakeIntensity = 9.5;
      this.audio.playGameOver();
      this.emitSnapshot();
      return;
    }

    // Sliced slab
    this.streak = 0;
    const overlapCenter = (overlapLeft + overlapRight) / 2;
    this.stack.push({
      x: overlapCenter,
      y: current.y,
      width: overlapWidth,
      hue: current.hue,
      perfectFlash: 0
    });

    const cutOnRight = delta > 0;
    const cutWidth = current.width - overlapWidth;
    const cutCenter = cutOnRight ? overlapRight + cutWidth / 2 : overlapLeft - cutWidth / 2;
    const cutEdgeX = cutOnRight ? overlapRight : overlapLeft;

    this.falling.push({
      x: cutCenter,
      y: current.y,
      width: cutWidth,
      hue: current.hue,
      vx: cutOnRight ? 66 : -66,
      vy: 36,
      angle: 0,
      vAngle: cutOnRight ? 3.4 : -3.4,
      alpha: 1
    });

    for (let i = 0; i < 9; i++) {
      this.sparks.push({
        x: cutEdgeX,
        y: current.y + SLAB_HEIGHT * 0.5,
        vx: (cutOnRight ? 1 : -1) * (35 + Math.random() * 90),
        vy: 30 + Math.random() * 85,
        size: 2.5,
        life: 0,
        maxLife: 0.36 + Math.random() * 0.2,
        hue: current.hue
      });
    }

    const points = onBeat ? 2 : 1;
    this.score += points;
    this.towerBounce = 3.5;
    this.shakeIntensity = 2.6;

    if (onBeat) {
      this.callouts.push({
        x: overlapCenter,
        y: current.y + SLAB_HEIGHT + 12,
        text: '+2 ON BEAT',
        color: '#38bdf8',
        life: 0,
        maxLife: 0.72
      });
    }

    this.audio.playDrop(false, 0, overlapWidth / this.baseWidth);
    this.checkMilestones(current.y);
    this.spawnNextSlab();
    this.emitSnapshot();
  }

  private checkMilestones(worldY: number): void {
    const floors = this.stack.length - 1;
    if (this.score > this.best) {
      this.best = this.score;
      this.saveInt(BEST_STORAGE_KEY, this.best);
    }
    if (floors > this.bestHeightFloors) {
      this.bestHeightFloors = floors;
      this.saveInt(BEST_HEIGHT_KEY, this.bestHeightFloors);
      if (!this.passedBestLine) {
        this.passedBestLine = true;
        this.audio.playNewBest();
        this.callouts.push({
          x: 0,
          y: worldY + SLAB_HEIGHT + 34,
          text: 'NEW RECORD!',
          color: '#fbbf24',
          life: 0,
          maxLife: 1.15
        });
      }
    }
  }

  private spawnSparks(x: number, y: number, slabWidth: number, hue: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      this.sparks.push({
        x: x + side * (slabWidth * 0.5) + (Math.random() - 0.5) * 12,
        y: y + SLAB_HEIGHT * 0.5,
        vx: side * (55 + Math.random() * 145),
        vy: 40 + Math.random() * 130,
        size: 2 + Math.random() * 2.5,
        life: 0,
        maxLife: 0.42 + Math.random() * 0.28,
        hue
      });
    }
  }

  private emitSnapshot(): void {
    const top = this.stack[this.stack.length - 1];
    const widthPct = top ? Math.max(1, Math.round((top.width / this.baseWidth) * 100)) : 100;
    const accuracyPct = this.totalDrops > 0 ? Math.round((this.perfectDrops / this.totalDrops) * 100) : 0;
    this.onSnapshot({
      phase: this.phase,
      score: this.score,
      best: this.best,
      streak: this.streak,
      maxStreak: this.maxStreak,
      widthPct,
      accuracyPct
    });
  }

  public startLoop(): void {
    this.lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stopLoop(): void {
    cancelAnimationFrame(this.rafId);
  }

  private update(dt: number): void {
    this.audioMetrics = this.audio.sample();
    this.onMeter(this.audioMetrics.level);

    if (this.hitStopTimer > 0) {
      this.hitStopTimer = Math.max(0, this.hitStopTimer - dt);
      return;
    }

    this.cameraY += (this.targetCameraY - this.cameraY) * Math.min(1, dt * 8.5);
    this.pulseGlow *= Math.pow(0.05, dt);
    this.towerBounce *= Math.pow(0.004, dt);
    this.shakeIntensity *= Math.pow(0.002, dt);

    for (const p of this.bgParticles) {
      p.y -= p.speed * dt * (1 + this.audioMetrics.bass * 1.6);
      if (p.y < -0.02) {
        p.y = 1.02;
        p.x = Math.random();
      }
    }

    for (const slab of this.stack) {
      if (slab.perfectFlash > 0) {
        slab.perfectFlash = Math.max(0, slab.perfectFlash - dt * 2.6);
      }
    }

    if (this.phase === 'playing' && this.active) {
      const limit = Math.max(135, this.baseWidth * 0.94);
      this.active.x += this.active.dir * this.active.speed * dt;
      if (this.active.x > limit) {
        this.active.x = limit;
        this.active.dir = -1;
      } else if (this.active.x < -limit) {
        this.active.x = -limit;
        this.active.dir = 1;
      }
    }

    for (let i = this.falling.length - 1; i >= 0; i--) {
      const p = this.falling[i];
      p.vy -= 820 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.vAngle * dt;
      p.alpha -= dt * 0.9;
      if (p.alpha <= 0 || p.y < this.cameraY - 420) {
        this.falling.splice(i, 1);
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life += dt;
      s.vy -= 300 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.life >= s.maxLife) {
        this.sparks.splice(i, 1);
      }
    }

    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.life += dt;
      if (w.life >= w.maxLife) {
        this.waves.splice(i, 1);
      }
    }

    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const c = this.callouts[i];
      c.life += dt;
      c.y += 38 * dt;
      if (c.life >= c.maxLife) {
        this.callouts.splice(i, 1);
      }
    }
  }

  private worldToScreenY(worldY: number): number {
    const groundY = this.height * 0.78;
    const beatKick = this.audioMetrics.beat * 3.5;
    return groundY - (worldY - this.cameraY) + this.towerBounce + beatKick;
  }

  private render(): void {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const audioLevel = this.audioMetrics.level;
    const audioBass = this.audioMetrics.bass;
    const audioBeat = this.audioMetrics.beat;

    ctx.save();
    if (this.shakeIntensity > 0.15) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const sy = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(sx, sy);
    }

    // Atmosphere shifts gently with height
    const floors = Math.max(0, this.stack.length - 1);
    const skyHue = (220 + floors * 2.5) % 360;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, `hsl(${skyHue}, 36%, 6%)`);
    skyGrad.addColorStop(1, '#080a0f');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-20, -20, this.width + 40, this.height + 40);

    // Subtle drifting parallax dust
    for (const p of this.bgParticles) {
      const py = (p.y * this.height + this.cameraY * 0.18) % (this.height + 20);
      ctx.fillStyle = `rgba(220, 232, 255, ${(p.alpha * (0.6 + audioLevel * 0.8)).toFixed(3)})`;
      ctx.fillRect(p.x * this.width, py, p.size, p.size);
    }

    // Audio-reactive radial aura
    const topHue = this.active?.hue ?? this.stack[this.stack.length - 1]?.hue ?? 200;
    const auraRadius = Math.max(this.width, this.height) * (0.42 + audioBass * 0.24 + audioBeat * 0.09);
    const auraAlpha = 0.08 + audioLevel * 0.22 + audioBeat * 0.12 + this.pulseGlow * 0.16;
    const grad = ctx.createRadialGradient(cx, this.height * 0.56, 10, cx, this.height * 0.56, auraRadius);
    grad.addColorStop(0, `hsla(${topHue}, 85%, 56%, ${auraAlpha.toFixed(3)})`);
    grad.addColorStop(1, 'rgba(9, 11, 16, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Altitude floor markers & personal best line
    this.renderAltitudeMarkers(cx);

    // Spectrum bars
    this.renderSpectrum(cx, audioLevel, topHue);

    // Pedestal under base slab
    const baseScreenY = this.worldToScreenY(0);
    if (baseScreenY < this.height + 120) {
      const pedW = this.baseWidth + 36;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.fillRect(cx - pedW / 2, baseScreenY, pedW, this.height - baseScreenY + 40);
      ctx.fillStyle = `hsla(${topHue}, 75%, 64%, ${(0.24 + audioLevel * 0.35 + audioBeat * 0.25).toFixed(3)})`;
      ctx.fillRect(cx - pedW / 2, baseScreenY, pedW, 2);
    }

    // Stacked slabs
    for (let i = 0; i < this.stack.length; i++) {
      const slab = this.stack[i];
      const screenY = this.worldToScreenY(slab.y);
      if (screenY < -60 || screenY > this.height + 60) continue;
      this.drawSlab(cx + slab.x, screenY, slab.width, slab.hue, audioLevel, slab.perfectFlash, i === this.stack.length - 1);
    }

    // Perfect shockwave seams
    for (const w of this.waves) {
      const t = w.life / w.maxLife;
      const expand = t * 58;
      const screenY = this.worldToScreenY(w.y);
      const alpha = (1 - t) * 0.85;
      ctx.strokeStyle = `hsla(${w.hue}, 95%, 78%, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        cx + w.x - (w.width + expand) / 2,
        screenY - SLAB_HEIGHT - t * 4,
        w.width + expand,
        SLAB_HEIGHT + t * 8
      );
    }

    // Active moving slab + smooth converging Beat Halo
    if (this.active) {
      const screenY = this.worldToScreenY(this.active.y);

      if (this.audio.mode !== 'off') {
        this.drawBeatHalo(
          cx + this.active.x,
          screenY,
          this.active.width,
          this.audioMetrics.beatPhase,
          this.audioMetrics.onBeat
        );
      }

      this.drawSlab(cx + this.active.x, screenY, this.active.width, this.active.hue, audioLevel, 0, true);

      const top = this.stack[this.stack.length - 1];
      if (top) {
        const topY = this.worldToScreenY(top.y + SLAB_HEIGHT);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.09 + audioLevel * 0.12).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(cx + top.x - top.width / 2, topY - 4);
        ctx.lineTo(cx + top.x - top.width / 2, screenY - SLAB_HEIGHT - 8);
        ctx.moveTo(cx + top.x + top.width / 2, topY - 4);
        ctx.lineTo(cx + top.x + top.width / 2, screenY - SLAB_HEIGHT - 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Falling cut pieces
    for (const p of this.falling) {
      const screenY = this.worldToScreenY(p.y);
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(cx + p.x, screenY - SLAB_HEIGHT / 2);
      ctx.rotate(p.angle);
      this.drawSlab(0, SLAB_HEIGHT / 2, p.width, p.hue, audioLevel * 0.5, 0, false);
      ctx.restore();
    }

    // Sparks
    for (const s of this.sparks) {
      const t = 1 - s.life / s.maxLife;
      const sx = cx + s.x;
      const sy = this.worldToScreenY(s.y);
      ctx.fillStyle = `hsla(${s.hue}, 94%, 76%, ${(t * 0.95).toFixed(3)})`;
      ctx.fillRect(sx - s.size / 2, sy - s.size / 2, s.size, s.size);
    }

    // Floating callouts
    ctx.textAlign = 'center';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    for (const c of this.callouts) {
      const t = 1 - c.life / c.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.min(1, t * 1.4);
      ctx.fillStyle = c.color;
      ctx.fillText(c.text, cx + c.x, this.worldToScreenY(c.y));
      ctx.restore();
    }

    ctx.restore();
  }

  private drawBeatHalo(
    centerX: number,
    bottomY: number,
    width: number,
    beatPhase: number,
    onBeat: boolean
  ): void {
    const ctx = this.ctx;
    // Converges smoothly toward the slab as beatPhase approaches 1.0 (next downbeat)
    const approach = beatPhase > 0.3 ? (1 - beatPhase) / 0.7 : 0;
    const pad = onBeat ? 3 : 3 + approach * 14;
    const rx = centerX - width / 2 - pad;
    const ry = bottomY - SLAB_HEIGHT - DEPTH_Y - pad;
    const rw = width + pad * 2;
    const rh = SLAB_HEIGHT + DEPTH_Y + pad * 2;
    const radius = 8;

    ctx.save();
    if (onBeat) {
      ctx.shadowColor = 'rgba(251, 191, 36, 0.75)';
      ctx.shadowBlur = 16;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.92)';
      ctx.lineWidth = 2;
    } else {
      const alpha = 0.14 + (1 - approach) * 0.22;
      ctx.strokeStyle = `rgba(251, 191, 36, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
    }

    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, radius);
    ctx.stroke();
    ctx.restore();
  }

  private renderAltitudeMarkers(cx: number): void {
    const ctx = this.ctx;
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    for (let floor = 10; floor <= 200; floor += 10) {
      const y = this.worldToScreenY(floor * SLAB_HEIGHT);
      if (y < 60 || y > this.height - 20) continue;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16, y);
      ctx.lineTo(this.width - 16, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillText(`${floor}F`, 18, y - 5);
    }

    if (this.phase === 'playing' && this.bestHeightFloors >= 3) {
      const bestY = this.worldToScreenY(this.bestHeightFloors * SLAB_HEIGHT);
      if (bestY > 60 && bestY < this.height - 20) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 1.25;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cx - this.baseWidth * 0.9, bestY);
        ctx.lineTo(cx + this.baseWidth * 0.9, bestY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.textAlign = 'right';
        ctx.fillText(`BEST ${this.bestHeightFloors}F`, cx + this.baseWidth * 0.9, bestY - 5);
      }
    }
  }

  private renderSpectrum(cx: number, audioLevel: number, hue: number): void {
    const bins = this.audioMetrics.spectrum;
    if (!bins.length || audioLevel < 0.005) return;

    const ctx = this.ctx;
    const barW = Math.max(4, Math.min(8, this.width / 72));
    const gap = 4;
    const baseLineY = this.height * 0.78;

    for (let i = 0; i < bins.length; i++) {
      const val = bins[i];
      if (val < 0.01) continue;
      const barH = val * Math.min(230, this.height * 0.35);
      const offset = (i + 0.5) * (barW + gap);
      const alpha = 0.08 + val * 0.2;
      ctx.fillStyle = `hsla(${(hue + i * 5) % 360}, 82%, 62%, ${alpha.toFixed(3)})`;
      ctx.fillRect(cx + offset - barW / 2, baseLineY - barH, barW, barH);
      ctx.fillRect(cx - offset - barW / 2, baseLineY - barH, barW, barH);
    }
  }

  private drawSlab(
    centerX: number,
    bottomY: number,
    width: number,
    hue: number,
    audioLevel: number,
    perfectFlash: number,
    isHighlighted: boolean
  ): void {
    const ctx = this.ctx;
    const x = centerX - width / 2;
    const y = bottomY - SLAB_HEIGHT;

    const boost = audioLevel * (isHighlighted ? 16 : 8) + perfectFlash * 24;
    const bodyLight = Math.min(70, 44 + boost * 0.65);
    const topLight = Math.min(92, 68 + boost * 0.95);

    // Front extruded face
    const bodyGrad = ctx.createLinearGradient(x, y, x, bottomY);
    bodyGrad.addColorStop(0, `hsl(${hue}, 74%, ${bodyLight}%)`);
    bodyGrad.addColorStop(1, `hsl(${hue}, 68%, ${Math.max(20, bodyLight - 16)}%)`);
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x, y, width, SLAB_HEIGHT);

    // Angled top 2.5D face
    const skew = Math.min(10, Math.max(3, width * 0.05));
    ctx.fillStyle = `hsl(${hue}, 86%, ${topLight}%)`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + skew, y - DEPTH_Y);
    ctx.lineTo(x + width - skew, y - DEPTH_Y);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();

    // Subtle crisp front edge highlight
    ctx.fillStyle = `hsla(${hue}, 95%, 88%, 0.45)`;
    ctx.fillRect(x, y, width, 1.5);

    if (perfectFlash > 0.02 || (isHighlighted && audioLevel > 0.06)) {
      const strokeAlpha = Math.min(0.95, perfectFlash * 0.9 + (isHighlighted ? audioLevel * 0.6 : 0));
      ctx.strokeStyle = `hsla(${hue}, 96%, 84%, ${strokeAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, width - 1), SLAB_HEIGHT - 1);
    }
  }
}

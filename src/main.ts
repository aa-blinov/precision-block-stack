import './style.css';
import { AudioEngine } from './audio';
import { PrecisionStackGame } from './game';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const scoreEl = document.getElementById('score-value') as HTMLElement;
const bestEl = document.getElementById('best-value') as HTMLElement;
const widthEl = document.getElementById('width-value') as HTMLElement;
const streakPillEl = document.getElementById('streak-pill') as HTMLElement;
const streakEl = document.getElementById('streak-value') as HTMLElement;

const meterBarEl = document.getElementById('meter-bar') as HTMLElement;

const btnTone = document.getElementById('btn-tone') as HTMLButtonElement;
const btnSfx = document.getElementById('btn-sfx') as HTMLButtonElement;
const iconSfxOn = document.getElementById('icon-sfx-on') as unknown as SVGElement;
const iconSfxOff = document.getElementById('icon-sfx-off') as unknown as SVGElement;

const overlayStart = document.getElementById('overlay-start') as HTMLElement;
const overlayGameover = document.getElementById('overlay-gameover') as HTMLElement;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnStartTone = document.getElementById('btn-start-tone') as HTMLButtonElement;
const btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;

const finalScoreEl = document.getElementById('final-score') as HTMLElement;
const finalBestEl = document.getElementById('final-best') as HTMLElement;
const finalAccuracyEl = document.getElementById('final-accuracy') as HTMLElement;
const finalStreakEl = document.getElementById('final-streak') as HTMLElement;

const audio = new AudioEngine();

function syncAudioButtons(): void {
  btnTone.setAttribute('aria-pressed', String(audio.mode === 'tone'));
  btnSfx.setAttribute('aria-pressed', String(audio.sfxEnabled));
  iconSfxOn.toggleAttribute('hidden', !audio.sfxEnabled);
  iconSfxOff.toggleAttribute('hidden', audio.sfxEnabled);
}

const game = new PrecisionStackGame(
  canvas,
  audio,
  (snap) => {
    scoreEl.textContent = String(snap.score);
    bestEl.textContent = String(snap.best);
    widthEl.textContent = `${snap.widthPct}%`;

    if (snap.streak >= 2) {
      streakEl.textContent = String(snap.streak);
      streakPillEl.hidden = false;
    } else {
      streakPillEl.hidden = true;
    }

    overlayStart.hidden = snap.phase !== 'ready';
    overlayGameover.hidden = snap.phase !== 'gameover';

    if (snap.phase === 'gameover') {
      finalScoreEl.textContent = String(snap.score);
      finalBestEl.textContent = String(snap.best);
      finalAccuracyEl.textContent = `${snap.accuracyPct}%`;
      finalStreakEl.textContent = String(snap.maxStreak);
    }
  },
  (level) => {
    const pct = Math.min(100, Math.round(level * 100));
    meterBarEl.style.width = `${pct}%`;
    meterBarEl.style.backgroundColor = pct > 72 ? '#34d399' : '#38bdf8';
  }
);

btnTone.addEventListener('click', () => {
  if (audio.mode === 'tone') {
    audio.stopSource();
  } else {
    audio.enableTestTone();
  }
  syncAudioButtons();
});

btnSfx.addEventListener('click', () => {
  audio.sfxEnabled = !audio.sfxEnabled;
  syncAudioButtons();
});

btnStart.addEventListener('click', () => {
  game.start();
});

btnStartTone.addEventListener('click', () => {
  audio.enableTestTone();
  syncAudioButtons();
  game.start();
});

btnRestart.addEventListener('click', () => {
  game.start();
});

// Tap / click directly on canvas drops the active slab
canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  game.drop();
});

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' && e.code !== 'Enter') return;
  const activeTag = document.activeElement?.tagName;
  if (activeTag === 'BUTTON' && e.code === 'Enter') return;

  e.preventDefault();
  if (!overlayStart.hidden || !overlayGameover.hidden) {
    game.start();
  } else {
    game.drop();
  }
});

window.addEventListener('resize', () => {
  game.resize();
});

syncAudioButtons();
game.startLoop();

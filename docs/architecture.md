# Architecture

`precision-block-stack` has zero runtime dependencies and splits responsibilities across three TypeScript modules:

1. **`src/audio.ts` (`AudioEngine`)**
   - Manages a lazy `AudioContext`, an `AnalyserNode` (`fftSize = 512`), and a 120 BPM 16th-note step sequencer (`enableTestTone()`).
   - Shifts bass and arpeggio chord progressions every 10 floors via `setTowerLevel(level)`.
   - Exposes `sample()` returning smoothed `level`, `bass`, `beat` transient pulse, and a 28-bin frequency spectrum.
   - Synthesizes pentatonic `playDrop()` chimes, slice thuds, `playNewBest()` arpeggios, and `playGameOver()` sweeps.

2. **`src/game.ts` (`PrecisionStackGame`)**
   - Owns the `requestAnimationFrame` loop, `devicePixelRatio`-aware Canvas 2D rendering, and camera tracking.
   - Evaluates slab overlap (`PERFECT_TOLERANCE_PX = 5.2`), spawns falling overhang pieces with angular velocity, shockwaves, sparks, and floating callouts.
   - Persists `best` score and `bestHeightFloors` in `localStorage`.

3. **`src/main.ts`**
   - Connects HUD elements, start/game-over overlays, pointer taps, and `Space`/`Enter` keyboard shortcuts to the game and audio engines.

# AGENTS.md — agent context for `precision-block-stack`

Browser-based 2.5D precision block-stacking arcade game with a built-in WebAudio 120 BPM synth beat and audio-reactive visuals.

## Run / build / test

```bash
npm ci
npm run build
npm run dev
```

## Where things live

| Path | What it is |
| --- | --- |
| `index.html` | Single-page shell, HUD, start/game-over overlays, Google Fonts |
| `src/main.ts` | DOM bindings, audio control toggles, keyboard/pointer routing |
| `src/game.ts` | Canvas 2D game loop, slicing physics, 2.5D slabs, particles, camera |
| `src/audio.ts` | WebAudio `AnalyserNode`, 120 BPM synth sequencer, procedural SFX |
| `src/style.css` | Responsive layout, HUD, overlays, mobile breakpoints |
| `docs/` | Architecture notes and screenshot directory |

## Traps

- **`vite.config.ts` keeps `base: './'`.** GitHub Pages serves this project under `/precision-block-stack/`; removing relative `base` breaks asset URLs in production.
- **HUD and overlays must sit above `#stage`.** Canvas `pointerdown` triggers `game.drop()`; keep interactive buttons outside `#stage` so toggling `Test Tone` or `SFX` never drops a slab.

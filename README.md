# Precision Block Stack

Tap or press Space to drop moving 2.5D slabs cleanly. Overhangs slice off with physics until the tower narrows, while a built-in WebAudio 120 BPM synth beat drives live spectrum visuals and `ON BEAT` score multipliers.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![CI](https://github.com/aa-blinov/precision-block-stack/actions/workflows/ci.yml/badge.svg)](https://github.com/aa-blinov/precision-block-stack/actions/workflows/ci.yml)

Play live: [aa-blinov.github.io/precision-block-stack](https://aa-blinov.github.io/precision-block-stack/)

---

## Quick start

```bash
git clone https://github.com/aa-blinov/precision-block-stack.git
cd precision-block-stack
npm install
npm run dev
```

## What it does

- **Precision slicing mechanics:** misaligned drops slice off the overhang, which falls and rotates away under gravity.
- **Perfect streaks & Fever mode:** exact alignments (`<= 5.2 px`) preserve width, restore width on streaks of `4+`, and unlock `×2` Fever multipliers at `5+`.
- **Audio-reactive WebAudio engine:** toggle **Test Tone** for a synthesized 120 BPM groove (kick, bass, hi-hat, arp) that shifts chord progressions every 10 floors, drives a 28-bin spectrum, and highlights `ON BEAT` `+2` drop windows.
- **Altitude & personal best tracking:** floor markers (`10F`, `20F`, ...), an in-world `BEST` record line, and `localStorage` persistence for score and accuracy.
- **Desktop & mobile controls:** tap anywhere on the canvas or press `Space` / `Enter`.

## Configuration

| Control | Default | Effect |
| --- | --- | --- |
| `Test Tone` | Off | Starts/stops the 120 BPM WebAudio synth beat and audio-reactive visuals |
| `SFX` | On | Enables/mutes synthesized pentatonic chimes and slice/game-over audio |

## How it works

The app runs a `requestAnimationFrame` Canvas 2D loop in [src/game.ts](src/game.ts) paired with a WebAudio synthesizer and `AnalyserNode` in [src/audio.ts](src/audio.ts). See [docs/architecture.md](docs/architecture.md) for module details.

## Development

```bash
npm run dev     # local Vite dev server
npm run build   # TypeScript typecheck + production Vite bundle
npm run preview # preview dist/ locally
```

## License

[MIT](LICENSE)

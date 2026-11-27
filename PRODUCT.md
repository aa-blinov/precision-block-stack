# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual arcade players on desktop and mobile browsers looking for a fast, tactile timing game with responsive visual and audio feedback.

## Product Purpose

Deliver a single-session, zero-asset arcade stacking game where players drop moving 2.5D slabs onto a growing tower, slice overhangs, chase personal best lines, and optionally sync drops to a procedural WebAudio beat.

## Positioning

Everything—graphics, physics, particles, 120 BPM synth groove, and sound effects—is generated in-browser with TypeScript, Canvas 2D, and WebAudio API with zero runtime dependencies.

## Operating Context

Runs as a static bundle on GitHub Pages (`https://aa-blinov.github.io/precision-block-stack/`) and locally via Vite (`npm run dev`). Persists best score and best floor count in `localStorage`.

## Capabilities and Constraints

- Zero runtime npm dependencies; builds to static HTML, CSS, and JS via Vite.
- Audio reactivity is powered by an internal WebAudio 120 BPM synthesizer (`Test Tone`) rather than microphone capture.
- Game state and high scores are stored locally in browser `localStorage` with no backend server.

## Brand Commitments

- Keep the canvas unobstructed so alignment edges remain legible at high speeds.
- Never require external assets or network audio downloads to start playing.

## Evidence on Hand

- TypeScript typechecking and production bundle verified via `tsc && vite build`.
- Desktop and `390×844` mobile viewports verified via Playwright browser runs with zero console errors.

## Product Principles

- **Clarity over clutter:** every visual effect supports timing and spatial judgment.
- **Immediate playability:** one tap or `Space` press starts the run and drops slabs.

## Accessibility & Inclusion

- Supports pointer tap/click as well as full keyboard control (`Space` and `Enter`) with visible focus rings and `aria-pressed` states on audio controls.
- High-contrast text and tabular monospace figures for all HUD counters.

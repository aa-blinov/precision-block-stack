---
name: precision-block-stack
description: Dark studio arcade aesthetic for a 2.5D audio-reactive block-stacking game.
colors:
  primary: "#38bdf8"
  neutral-bg: "#090b10"
  surface: "#0f121b"
  good: "#34d399"
  warn: "#fbbf24"
typography:
  body:
    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.55
  title:
    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
rounded:
  sm: "6px"
  control: "10px"
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
---

# Design System: precision-block-stack

## Overview

**Creative North Star: "Tactile Acoustic Monolith"** — a dark, focused stage where crisp 2.5D extruded slabs and subtle audio-reactive light keep the player's eye locked on alignment edges.

## Color & Surface

- Canvas background uses deep obsidian `#090b10` shifting gently in hue as tower altitude climbs.
- Slab colors step smoothly around the HSL wheel (`+11°` per floor) with a bright top bevel face so overhang edges remain razor-sharp.
- `ON BEAT` windows use warm amber `#fbbf24`; `PERFECT` streaks use emerald `#34d399`.

## Typography

- `Space Grotesk` for headings, controls, and overlay copy.
- `JetBrains Mono` with `tabular-nums` for score, best, width percentage, and floor markers.

## Layout & Responsive Rules

- Full-viewport `100dvh` canvas stage with a non-intrusive top HUD.
- On viewports `<= 560px`, HUD controls tighten into a single horizontal row and Game Over stats reflow into a `2×2` grid.

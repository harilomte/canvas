# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint with Next.js + TypeScript rules
- No test framework configured

## Architecture

Infinite canvas drawing app. Next.js 16 App Router, Konva.js for canvas rendering, Zustand for state, Tailwind CSS for toolbar UI. No backend — all data persists to localStorage.

**Data flow:** User interactions in `InfiniteCanvas` → Zustand store actions → React re-render → Konva renders shapes to canvas → `pushHistory()` snapshots state → Zustand auto-persists to localStorage.

### Key files

- `src/store/canvasStore.ts` — Single Zustand store. Manages all elements, tool/color/size selection, zoom/pan, and undo/redo history (max 50 snapshots). Persists element data and style preferences but not history.
- `src/components/InfiniteCanvas.tsx` — Core canvas. Konva Stage with two layers: grid background (non-interactive) and content layer (shapes). Handles all mouse/touch events, keyboard shortcuts, text editing via overlay textareas, and PNG export.
- `src/components/Toolbar.tsx` — Tool selection, color pickers, sliders, zoom controls, export/clear buttons.
- `src/app/page.tsx` — Dynamically imports InfiniteCanvas with `ssr: false` (Konva requires window).

### Patterns

- **Toolbar → Canvas communication** uses `window.dispatchEvent(CustomEvent)` for image uploads (`canvas-image-upload`) and export (`canvas-export`), avoiding prop drilling through the page component.
- **Transform normalization:** After Konva transforms, scale is absorbed into width/height/radius/fontSize and reset to 1 so elements store absolute dimensions.
- **Text editing:** Clicking with text tool or double-clicking existing text creates a positioned `<textarea>` overlay that syncs with canvas zoom/pan coordinates.
- **CanvasElement** is the universal shape type — `type` field determines which Konva component renders it, with optional fields for each shape kind (points for pen/line/arrow, radius for circle, text/fontSize for text, imageSrc for images).
- **Eraser** is click-to-delete, not a brush. Pen/line/arrow disable transform resize anchors.

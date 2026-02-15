# Reveal in Navigation — Obsidian Plugin

## Project Overview
Obsidian plugin that auto-reveals the active file in the File Explorer sidebar without transferring keyboard focus. Solves the accidental deletion bug in the reference plugin (obsidian-reveal-active-file).

## Tech Stack
- **Language:** TypeScript
- **Platform:** Obsidian Plugin API
- **Build:** esbuild
- **Output:** main.js (single CommonJS bundle)

## Key Files
- `main.ts` — Plugin entry point, event handlers
- `reveal.ts` — Core reveal logic (explorer manipulation)
- `settings.ts` — Settings tab and data interface
- `manifest.json` — Obsidian plugin manifest

## Build Commands
- `npm run build` — Production build
- `npm run dev` — Watch mode

## Dev Setup
- Obsidian vault: `C:\Users\snapy\OneDrive\Obsidian\ObsidianMP\`
- Plugin symlinked to: `.obsidian\plugins\reveal-in-navigation` → this project folder
- Test by building then Ctrl+R in Obsidian to reload

## Critical Design Decision
**Do NOT use** `file-explorer:reveal-active-file` command — it focuses the explorer and causes the deletion bug. Instead, directly manipulate the File Explorer view's tree to reveal files without focus transfer.

## Project Management
- Spec: `.mpx/SPEC.md`
- Roadmap: `.mpx/ROADMAP.md`
- Phases: `.mpx/phases/`

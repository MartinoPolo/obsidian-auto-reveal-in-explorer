# Implementation Roadmap

Project: Reveal in Navigation
Generated: 2026-02-15
Total Phases: 3

## Overview
Build an Obsidian plugin that auto-reveals the active file in the File Explorer without transferring keyboard focus. Phase 1 sets up the project scaffold and minimal plugin. Phase 2 implements the core reveal mechanism — the critical differentiator from the reference plugin. Phase 3 adds settings UI, manual command, and polish.

## Phases

- [x] **Phase 1: Foundation** — 6 tasks | Dependencies: None
- [x] **Phase 2: Core Reveal** — 5 tasks | Dependencies: Phase 1
- [x] **Phase 3: Settings & Polish** — 5 tasks | Dependencies: Phase 2

## Dependency Graph
Phase 1 (Foundation) → Phase 2 (Core Reveal) → Phase 3 (Settings & Polish)

## Phase Details

### Phase 1: Foundation
**Goal:** Working plugin scaffold that loads in Obsidian
**Deliverables:** package.json, tsconfig, esbuild config, manifest.json, empty plugin class, successful build, symlink to Obsidian vault

### Phase 2: Core Reveal
**Goal:** Auto-reveal active file in explorer without focus transfer
**Deliverables:** Reveal logic, file-open event listener, debouncing, explorer visibility check

### Phase 3: Settings & Polish
**Goal:** User-configurable settings, manual command, edge case handling
**Deliverables:** Settings tab, command palette command, styles.css, robust error handling

## Decisions
- Use esbuild over rollup — modern Obsidian plugin standard, faster builds
- Direct explorer tree manipulation over command execution — avoids focus transfer bug
- Fallback to command + focus restore if direct manipulation proves fragile

## Blockers
None

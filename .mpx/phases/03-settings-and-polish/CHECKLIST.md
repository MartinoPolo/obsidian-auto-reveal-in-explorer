# Phase 3: Settings & Polish

**Status:** Complete
**Dependencies:** Phase 2

## Objective
Add user-configurable settings, manual reveal command, and handle edge cases for a production-ready plugin.

## Scope
- Settings tab (auto-reveal toggle, delay slider)
- Manual reveal command for command palette
- Edge case handling (no file, explorer disabled, renamed files)
- Optional highlight styles

## Out of Scope
- New features beyond spec

---

## Tasks

### Settings

- [x] Create settings.ts with settings interface and tab
  PluginSettingTab subclass. Settings: autoReveal (boolean, default true), revealDelay (number, default 150). Persist via loadData/saveData. Changes apply immediately.

- [x] Wire settings into main.ts and reveal logic
  Load settings on plugin load. Pass autoReveal toggle to event handler. Pass revealDelay to debounce. Update debounce when settings change.

### Commands

- [x] Add manual reveal command
  Register "Auto Reveal in Explorer: Reveal active file" command. Works regardless of autoReveal setting. Same no-focus-transfer behavior.

### Edge Cases & Polish

- [x] Handle edge cases
  No active file (skip). Explorer plugin disabled (skip gracefully). File not found in tree (skip). Plugin unload cleanup (remove all listeners/timers).

### Completion Criteria

- [x] Settings panel works, command works, no errors on edge cases

---
Progress: 5/5 tasks complete

## Decisions
- rebuildDebouncedReveal() recreates the debounced function on every settings save, ensuring delay changes apply immediately without plugin reload
- Slider range 50-1000ms with step 10 — wide enough for user preference, step size avoids excessive granularity
- Manual command calls revealFileInExplorer directly (no debounce) — user explicitly invoked it, instant feedback expected
- Edge cases already handled by defensive early returns in reveal.ts; Obsidian's Plugin base class auto-cleans registerEvent/addCommand on unload

## Blockers
None

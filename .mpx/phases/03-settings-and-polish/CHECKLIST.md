# Phase 3: Settings & Polish

**Status:** In Progress
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

- [ ] Add manual reveal command
  Register "Reveal in Navigation: Reveal active file" command. Works regardless of autoReveal setting. Same no-focus-transfer behavior.

### Edge Cases & Polish

- [ ] Handle edge cases
  No active file (skip). Explorer plugin disabled (skip gracefully). File not found in tree (skip). Plugin unload cleanup (remove all listeners/timers).

### Completion Criteria

- [ ] Settings panel works, command works, no errors on edge cases

---
Progress: 2/5 tasks complete

## Decisions
- rebuildDebouncedReveal() recreates the debounced function on every settings save, ensuring delay changes apply immediately without plugin reload
- Slider range 50-1000ms with step 10 — wide enough for user preference, step size avoids excessive granularity

## Blockers
None

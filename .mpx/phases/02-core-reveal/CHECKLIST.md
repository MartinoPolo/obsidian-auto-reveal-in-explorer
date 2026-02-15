# Phase 2: Core Reveal

**Status:** Not Started
**Dependencies:** Phase 1

## Objective
Implement the core reveal mechanism — auto-scroll the File Explorer to the active file without transferring keyboard focus.

## Scope
- File Explorer view access and tree manipulation
- Reveal logic (expand parents, scroll into view, no focus)
- file-open event listener with debouncing
- Explorer visibility detection

## Out of Scope
- Settings UI, manual command, styles

---

## Tasks

### Reveal Logic

- [ ] Implement reveal.ts — core reveal function
  1. Get explorer leaves: `app.workspace.getLeavesOfType('file-explorer')`
  2. Access file tree: `(leaf.view as any).fileItems` (Map<string, FileItem>)
  3. Look up target: `fileItems[file.path]`
  4. Expand parents: walk `fileItem.parent` chain, call `setCollapsed(false)` on each
  5. Get DOM element: `fileItem.selfEl` (HTMLElement)
  6. Check visibility: compare element bounding rect vs container viewport rect
  7. Scroll if needed: `element.scrollIntoView({ block: 'center', behavior: 'smooth' })`
  8. Never call setActiveLeaf on explorer — focus stays in editor

- [ ] Implement explorer visibility check
  Check `leaf.containerEl` computed style `display !== "none"`. Also handle case where File Explorer plugin is disabled (no leaves returned). Skip reveal if explorer hidden.

### Event Handling

- [ ] Register file-open event listener in main.ts
  Listen to `workspace.on('file-open')`. Call debounced reveal. Clean up listener on unload.

- [ ] Add debounce utility for reveal calls
  Configurable delay (hardcode 150ms for now). Cancel pending reveal on new file-open. Only reveal the final file in rapid sequence.

### Completion Criteria

- [ ] Switching files auto-reveals in explorer without focus transfer

---
Progress: 0/5 tasks complete

## Decisions
- Direct tree manipulation via `fileItems` / `setCollapsed` / `selfEl` — confirmed viable from quick-explorer and obsidian-reveal-active-file source

## Blockers
None

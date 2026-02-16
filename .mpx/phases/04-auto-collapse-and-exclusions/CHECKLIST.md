# Phase 4: Auto-Collapse & Exclusions

**Status:** Complete
**Dependencies:** Phase 2

## Objective
Track which folders the plugin expands during reveal. Collapse them when navigating away. Allow users to exclude specific folders from auto-expand.

## Scope
- Expansion state tracking per-reveal
- Auto-collapse on file switch/close (only plugin-expanded folders)
- Shared-parent awareness (don't collapse folders still needed by the new file)
- Excluded folders setting with UI
- Prefix-based folder path matching

## Out of Scope
- Remembering expansion state across plugin restarts
- Nested exclusion rules (wildcards, regex)

---

## Tasks

### Expansion Tracking

- [x] Track folders expanded by the plugin during reveal
  In reveal.ts, before calling setCollapsed(false), check if the folder is already expanded. If we expanded it, record the folder path in a Set. Store this Set per-reveal (associated with the revealed file path). Replaces or extends expandParents().

- [x] Collapse tracked folders on file switch
  When a new file is revealed, compute which previously-expanded folders are NOT in the new file's parent chain. Collapse those folders (setCollapsed(true)). Then expand new file's parents as usual, tracking new expansions. Clear old tracking state.

- [x] Handle file close (no active file)
  When file-open fires with null (last file closed), collapse all tracked folders and clear tracking state.

### Excluded Folders

- [x] Add excludedFolders setting
  Add `excludedFolders: string[]` to AutoRevealInExplorerSettings (default: []). In expandParents(), skip expanding any folder whose path matches or is a prefix of an excluded folder path. If an excluded folder is in the parent chain, skip expanding it and all ancestors above it (file won't be revealed — this is intentional).

- [x] Add excluded folders UI in settings tab
  List of excluded folder paths with add/remove controls. Text input + add button. Each entry shows folder path with a remove button. Changes persist immediately.

### Completion Criteria

- [x] Auto-collapse works on file switch, excluded folders prevent expansion, settings UI functional

---
Progress: 6/6 tasks complete

## Decisions
- **ExpansionTracker as exported class in reveal.ts**: Keeps tracking logic co-located with reveal logic. main.ts instantiates and passes it through. The tracker is shared between debounced reveal and file-close handler.
- **Path-based folder lookup instead of FileItem parent walking**: expandParentsWithTracking computes folder paths from the file path string (splitting by "/") and looks up each in fileItems. More reliable than reverse-mapping FileItem objects to paths.
- **collapsed !== false check**: Obsidian's FileItem.collapsed is truthy when collapsed. We check `collapsed !== false` to be safe with undefined (vault root items may lack the property). Only folders we actually expand get tracked.
- **Manual command (reveal-active-file) does not use tracker**: Intentional — manual reveals should not cause auto-collapse behavior.

- **Excluded folders use break, not continue**: When iterating deepest-first parent folders, hitting an excluded folder breaks the loop entirely. This prevents expanding ancestors above the excluded folder, which is intentional — the file won't be fully revealed if an excluded folder is in its parent chain.
- **excludedFolders threaded as array parameter**: Passed from settings through createDebouncedReveal -> revealFileInExplorer -> expandParentsWithTracking. Rebuilt when settings change via rebuildDebouncedReveal().
- **Settings UI re-renders on add**: Calling this.display() after adding clears the text input. Remove only re-renders the list container for minimal DOM churn.

## Blockers
None

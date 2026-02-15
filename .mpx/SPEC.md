# Reveal in Navigation — Specification

Generated: 2026-02-15

## Project Overview

Obsidian plugin that automatically reveals the active file in the File Explorer sidebar when switching tabs or opening files — similar to VS Code's "Explorer Auto Reveal" setting. Unlike the existing [obsidian-reveal-active-file](https://github.com/shichongrui/obsidian-reveal-active-file) plugin, this implementation keeps keyboard focus in the editor, preventing accidental file deletion.

## Problem Statement

The reference plugin (`obsidian-reveal-active-file`) uses Obsidian's built-in `file-explorer:reveal-active-file` command which:
1. Reveals the file in the explorer
2. **Focuses the explorer leaf** — transferring keyboard focus away from the editor
3. Attempts to refocus the editor via `setActiveLeaf(leaf, { focus: true })` after an async wait
4. Race condition: between steps 2-3, pressing Delete deletes the focused file in explorer

**Our solution:** Reveal the file in the explorer tree by directly manipulating the File Explorer view's DOM/API to scroll to and highlight the file **without transferring focus** from the editor.

## Tech Stack

- **Language:** TypeScript
- **Platform:** Obsidian Plugin API (desktop + mobile)
- **Build:** esbuild (standard Obsidian plugin toolchain)
- **Min Obsidian Version:** 1.0.0
- **Output:** `main.js` (single bundle)

## Requirements

### R1: Auto-Reveal on File Open
When the user opens or switches to a file (via tab click, link follow, quick switcher, etc.), the plugin automatically scrolls the File Explorer sidebar to reveal that file in the tree.

**Acceptance Criteria:**
- File is visible in the explorer tree after switching
- Parent folders are expanded if collapsed
- Explorer scrolls to show the file
- Works for all file-open methods (tabs, links, quick switcher, command palette)

### R2: No Focus Transfer
The File Explorer must NOT receive keyboard focus during the reveal operation. The editor must retain focus at all times.

**Acceptance Criteria:**
- After reveal, keyboard focus remains in the editor
- User can continue typing immediately
- Delete key does NOT delete the revealed file
- No visible focus flash/flicker on the explorer

### R3: Explorer Visibility Awareness
Only attempt reveal when the File Explorer sidebar is actually visible/open.

**Acceptance Criteria:**
- No errors when explorer is closed/hidden
- No forced opening of the explorer sidebar
- Reveal triggers when explorer becomes visible (if file changed while hidden)

### R4: Debounced Reveal
Rapid file switches (e.g., cycling through tabs quickly) should not cause performance issues.

**Acceptance Criteria:**
- Reveal is debounced (configurable delay, default ~150ms)
- Only the final file in a rapid switch sequence is revealed
- No visual jitter during rapid switching

### R5: Settings
Plugin settings panel with:
- **Auto-reveal toggle** — enable/disable the feature (default: enabled)
- **Reveal delay** — debounce delay in milliseconds (default: 150ms)

**Acceptance Criteria:**
- Settings persist across Obsidian restarts
- Changes take effect immediately without restart
- Settings accessible via Obsidian Settings → Community Plugins → Reveal in Navigation

### R6: Manual Reveal Command
Provide a command palette command to manually trigger reveal for the current file.

**Acceptance Criteria:**
- Command: "Reveal in Navigation: Reveal active file"
- Works regardless of auto-reveal setting
- Same no-focus-transfer behavior as auto-reveal

### R7: Auto-Collapse Expanded Folders
When revealing a file causes parent folders to expand, track those expansions. When the user navigates away from the file (switches to another file or closes it), auto-collapse the folders that were expanded — restoring the explorer tree to its prior state.

**Acceptance Criteria:**
- Only collapse folders that the plugin itself expanded (not folders the user manually opened)
- Collapse triggers on file switch or file close
- If the next file shares some expanded parents, only collapse the unshared ones
- Rapid file switching does not cause jitter (respects debounce)

### R8: Excluded Folders
Settings list of folder paths that should be excluded from auto-expand during reveal. Files inside excluded folders are still highlighted in the explorer if already visible, but their parent folders are not expanded.

**Acceptance Criteria:**
- Setting: list of folder paths to exclude (e.g., `Daily`, `Archive/2024`)
- Matching is prefix-based on the folder path
- If a file's parent chain includes an excluded folder, skip expanding that folder and all ancestors above it
- Excluded folders can be added/removed in settings, changes apply immediately
- Default: empty list (no exclusions)

## Technical Approach

### Reveal Mechanism (Critical)

**Do NOT use** `file-explorer:reveal-active-file` command — it focuses the explorer.

**Instead, directly interact with the File Explorer view:**
1. Get the File Explorer leaf via `app.workspace.getLeavesOfType('file-explorer')`
2. Access the file explorer view's internal file tree
3. Use the view's `revealInFolder` or equivalent internal method, OR manipulate the tree DOM to:
   - Expand parent folders to the target file
   - Scroll the file item into view
   - Apply visual highlight without focus transfer

**Fallback approach:** Use the command but capture and restore `document.activeElement` synchronously before/after, preventing any focus change.

### Event Handling

Listen to `file-open` event on `app.workspace`:
```
app.workspace.on('file-open', (file) => { ... })
```

Debounce the handler to avoid rapid-fire reveals.

### File Explorer Detection

Check if File Explorer is visible:
```
const explorerLeaves = app.workspace.getLeavesOfType('file-explorer');
// Check if any leaf is visible (not in collapsed sidebar)
```

## File Structure

```
/
├── main.ts              # Plugin entry point, event handlers
├── reveal.ts            # Core reveal logic (explorer manipulation)
├── settings.ts          # Settings tab and data interface
├── manifest.json        # Obsidian plugin manifest
├── package.json         # Dependencies and build scripts
├── tsconfig.json        # TypeScript configuration
├── esbuild.config.mjs   # Build configuration
├── .gitignore
└── styles.css           # Minimal styles for highlight (if needed)
```

## Dependencies

- `obsidian` — Obsidian API (dev dependency, not bundled)
- `@types/node` — Node.js types (dev dependency)
- `esbuild` — Bundler (dev dependency)
- `typescript` — Compiler (dev dependency)
- `builtin-modules` — For esbuild externals (dev dependency)

## Development Setup

The plugin project folder must be symlinked into the Obsidian vault's plugins directory for live development/testing:

```cmd
mklink /D "C:\Users\snapy\OneDrive\Obsidian\ObsidianMP\.obsidian\plugins\reveal-in-navigation" "C:\_MP_projects\obsidian-plugin-reveal-in-navigation"
```

This allows building in-place and immediately testing in Obsidian via "Reload app without saving" (Ctrl+R).

## Constraints

- Must not use private/internal Obsidian APIs that could break across versions (prefer stable patterns used by popular plugins)
- Must handle the case where File Explorer plugin is disabled
- Must clean up all event listeners on plugin unload
- Bundle size should be minimal (< 20KB)
- No runtime dependencies — only dev dependencies

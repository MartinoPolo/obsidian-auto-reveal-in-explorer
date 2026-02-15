import { App, TFile, WorkspaceLeaf } from "obsidian";

/**
 * Internal Obsidian File Explorer types.
 * These are not part of the public API but are stable across versions.
 */
interface FileItem {
  selfEl: HTMLElement;
  parent?: FileItem;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

interface FileExplorerView {
  fileItems: Record<string, FileItem>;
  containerEl: HTMLElement;
}

/**
 * Tracks which folders the plugin expanded during reveal.
 * Enables auto-collapse of plugin-expanded folders when navigating away,
 * while preserving folders the user expanded manually.
 */
export class ExpansionTracker {
  /** Folder paths expanded by the plugin for the current reveal. */
  private expandedFolderPaths: Set<string> = new Set();

  /**
   * Record that the plugin expanded a folder.
   */
  trackExpansion(folderPath: string): void {
    this.expandedFolderPaths.add(folderPath);
  }

  /**
   * Collapse all previously-tracked folders that are NOT in the given set of
   * folder paths to keep. Then clear tracking state.
   */
  collapsePreviousExpansions(
    folderPathsToKeep: Set<string>,
    explorerView: FileExplorerView,
  ): void {
    for (const folderPath of this.expandedFolderPaths) {
      if (folderPathsToKeep.has(folderPath)) {
        continue;
      }
      const folderItem = explorerView.fileItems[folderPath];
      if (folderItem?.setCollapsed) {
        folderItem.setCollapsed(true);
      }
    }
    this.expandedFolderPaths.clear();
  }

  /**
   * Collapse ALL tracked folders and clear state.
   * Used when no active file remains (all files closed).
   */
  collapseAllTracked(explorerView: FileExplorerView): void {
    this.collapsePreviousExpansions(new Set(), explorerView);
  }

  /**
   * Get the current set of tracked folder paths (for testing/debugging).
   */
  getTrackedPaths(): ReadonlySet<string> {
    return this.expandedFolderPaths;
  }
}

function getVisibleExplorerLeaf(app: App): WorkspaceLeaf | null {
  const leaves = app.workspace.getLeavesOfType("file-explorer");
  if (leaves.length === 0) {
    return null;
  }

  for (const leaf of leaves) {
    const computedStyle = window.getComputedStyle(leaf.containerEl);
    if (computedStyle.display !== "none") {
      return leaf;
    }
  }

  return null;
}

/**
 * Compute all ancestor folder paths for a given file path.
 * Example: "a/b/c/note.md" -> ["a/b/c", "a/b", "a"]
 */
function getParentFolderPaths(filePath: string): string[] {
  const parts = filePath.split("/");
  parts.pop(); // Remove filename
  const paths: string[] = [];
  while (parts.length > 0) {
    paths.push(parts.join("/"));
    parts.pop();
  }
  return paths;
}

/**
 * Check if a folder path matches any excluded folder (exact match or child of excluded).
 */
function isFolderExcluded(folderPath: string, excludedFolders: string[]): boolean {
  for (const excluded of excludedFolders) {
    if (folderPath === excluded || folderPath.startsWith(excluded + "/")) {
      return true;
    }
  }
  return false;
}

/**
 * Expand parent folders of a file item, tracking which folders the plugin
 * actually expanded (were previously collapsed). Already-expanded folders
 * are skipped and not tracked, preserving user's manual expansions.
 * Stops expanding when an excluded folder is encountered.
 */
function expandParentsWithTracking(
  fileItem: FileItem,
  filePath: string,
  explorerView: FileExplorerView,
  tracker: ExpansionTracker,
  excludedFolders: string[] = [],
): void {
  const folderPaths = getParentFolderPaths(filePath);

  // folderPaths is deepest-first: ["a/b/c", "a/b", "a"]
  // If an excluded folder is hit, stop expanding it and all ancestors above it.
  for (const folderPath of folderPaths) {
    if (isFolderExcluded(folderPath, excludedFolders)) {
      break;
    }
    const folderItem = explorerView.fileItems[folderPath];
    if (!folderItem?.setCollapsed) {
      continue;
    }
    // Only track if the folder was collapsed (we're the ones expanding it)
    if (folderItem.collapsed !== false) {
      tracker.trackExpansion(folderPath);
    }
    folderItem.setCollapsed(false);
  }
}

/**
 * Simple expand without tracking — used by the manual command.
 */
function expandParents(fileItem: FileItem): void {
  let current = fileItem.parent;
  while (current) {
    if (current.setCollapsed) {
      current.setCollapsed(false);
    }
    current = current.parent;
  }
}

function findScrollableAncestor(element: HTMLElement): HTMLElement | null {
  let current = element.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    if (style.overflowY === "auto" || style.overflowY === "scroll") {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function scrollToElementInContainer(element: HTMLElement, scrollContainer: HTMLElement): void {
  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();

  const isVisible =
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom;

  console.log("[RIN] elementRect:", elementRect.top, elementRect.bottom);
  console.log("[RIN] containerRect:", containerRect.top, containerRect.bottom);
  console.log("[RIN] isVisible:", isVisible);

  if (!isVisible) {
    const offsetInContainer = elementRect.top - containerRect.top + scrollContainer.scrollTop;
    const centeredScroll = offsetInContainer - scrollContainer.clientHeight / 2;
    console.log("[RIN] scrolling to:", centeredScroll);
    scrollContainer.scrollTop = Math.max(0, centeredScroll);
  }
}

function estimateScrollPosition(
  filePath: string,
  explorerView: FileExplorerView,
  scrollContainer: HTMLElement,
): void {
  const sortedPaths = Object.keys(explorerView.fileItems).sort();
  const targetIndex = sortedPaths.indexOf(filePath);
  const totalItems = sortedPaths.length;

  // Get total content height from virtual scroll's inner div
  const contentDiv = scrollContainer.firstElementChild as HTMLElement;
  const totalHeight = contentDiv
    ? (parseFloat(getComputedStyle(contentDiv).minHeight) || contentDiv.scrollHeight)
    : scrollContainer.scrollHeight;

  const estimatedPosition = (targetIndex / totalItems) * totalHeight;
  console.log("[RIN] estimate — index:", targetIndex, "/", totalItems, "totalHeight:", totalHeight, "scrollTo:", estimatedPosition);
  scrollContainer.scrollTop = Math.max(0, estimatedPosition - scrollContainer.clientHeight / 2);
}

/**
 * Reveal a file in the File Explorer without transferring keyboard focus.
 * Expands parent folders, scrolls into view if needed.
 *
 * When a tracker is provided:
 * 1. Collapses previously plugin-expanded folders not needed by the new file
 * 2. Expands new parents with tracking (only records folders that were collapsed)
 *
 * Without a tracker, expands parents without tracking (manual command use).
 */
export function revealFileInExplorer(app: App, file: TFile, tracker?: ExpansionTracker, excludedFolders: string[] = []): void {
  const leaf = getVisibleExplorerLeaf(app);
  if (!leaf) {
    return;
  }

  const explorerView = leaf.view as unknown as FileExplorerView;
  if (!explorerView.fileItems) {
    return;
  }

  const fileItem = explorerView.fileItems[file.path];
  if (!fileItem) {
    return;
  }

  if (tracker) {
    // Compute new file's parent folder paths to determine which to keep expanded
    const newParentPaths = new Set(getParentFolderPaths(file.path));
    tracker.collapsePreviousExpansions(newParentPaths, explorerView);
    expandParentsWithTracking(fileItem, file.path, explorerView, tracker, excludedFolders);
  } else {
    expandParents(fileItem);
  }

  const element = fileItem.selfEl;
  if (!element) {
    return;
  }

  // Wait for virtual scroll to update DOM after parent expansion.
  // Double rAF: frame 1 = layout recalc, frame 2 = virtual scroll renders items.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const scrollContainer =
        findScrollableAncestor(element)
        ?? explorerView.containerEl.querySelector(".nav-files-container") as HTMLElement
        ?? explorerView.containerEl;

      console.log("[RIN] scrollContainer:", scrollContainer.className);
      console.log("[RIN] element in DOM:", document.body.contains(element));
      console.log("[RIN] explorerView keys:", Object.keys(explorerView));
      console.log("[RIN] fileItem keys:", Object.keys(fileItem));

      if (document.body.contains(element)) {
        // Element rendered — use rect-based scroll
        scrollToElementInContainer(element, scrollContainer);
      } else {
        // Element detached by virtual scroll — estimate position, scroll, then fine-tune
        estimateScrollPosition(file.path, explorerView, scrollContainer);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            console.log("[RIN] after estimate - element in DOM:", document.body.contains(element));
            if (document.body.contains(element)) {
              scrollToElementInContainer(element, scrollContainer);
            }
          });
        });
      }
    });
  });
}

/**
 * Collapse all folders tracked by the expansion tracker.
 * Called when no active file remains (all files closed).
 */
export function collapseAllTrackedFolders(app: App, tracker: ExpansionTracker): void {
  const leaf = getVisibleExplorerLeaf(app);
  if (!leaf) {
    return;
  }
  const explorerView = leaf.view as unknown as FileExplorerView;
  if (!explorerView.fileItems) {
    return;
  }
  tracker.collapseAllTracked(explorerView);
}

/**
 * Creates a debounced version of revealFileInExplorer.
 * Cancels pending reveal on each new call — only the final file in a rapid
 * sequence gets revealed.
 */
export function createDebouncedReveal(
  app: App,
  delayMs: number = 150,
  tracker?: ExpansionTracker,
  excludedFolders: string[] = [],
): { reveal: (file: TFile) => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function reveal(file: TFile): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      revealFileInExplorer(app, file, tracker, excludedFolders);
    }, delayMs);
  }

  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  return { reveal, cancel };
}

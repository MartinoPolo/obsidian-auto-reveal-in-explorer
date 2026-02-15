import { App, TFile, WorkspaceLeaf } from "obsidian";

/**
 * Internal Obsidian File Explorer types.
 * These are not part of the public API but are stable across versions.
 */
interface FileItem {
  selfEl: HTMLElement;
  parent?: FileItem;
  setCollapsed?: (collapsed: boolean) => void;
}

interface FileExplorerView {
  fileItems: Record<string, FileItem>;
  containerEl: HTMLElement;
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

function expandParents(fileItem: FileItem): void {
  let current = fileItem.parent;
  while (current) {
    if (current.setCollapsed) {
      current.setCollapsed(false);
    }
    current = current.parent;
  }
}

function isElementVisible(element: HTMLElement, container: HTMLElement): boolean {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom
  );
}

/**
 * Reveal a file in the File Explorer without transferring keyboard focus.
 * Expands parent folders, scrolls into view if needed.
 */
export function revealFileInExplorer(app: App, file: TFile): void {
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

  expandParents(fileItem);

  const element = fileItem.selfEl;
  if (!element) {
    return;
  }

  // Find the scrollable container within the explorer
  const scrollContainer =
    explorerView.containerEl.querySelector(".nav-files-container") as HTMLElement
    ?? explorerView.containerEl;

  if (!isElementVisible(element, scrollContainer)) {
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

/**
 * Creates a debounced version of revealFileInExplorer.
 * Cancels pending reveal on each new call — only the final file in a rapid
 * sequence gets revealed.
 */
export function createDebouncedReveal(
  app: App,
  delayMs: number = 150,
): { reveal: (file: TFile) => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function reveal(file: TFile): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      revealFileInExplorer(app, file);
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

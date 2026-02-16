import { Plugin, TFile } from "obsidian";
import {
  collapseAllTrackedFolders,
  createDebouncedReveal,
  ExpansionTracker,
  revealFileInExplorer,
} from "./reveal";
import {
  DEFAULT_SETTINGS,
  AutoRevealInExplorerSettingTab,
  type AutoRevealInExplorerSettings,
} from "./settings";

export default class AutoRevealInExplorerPlugin extends Plugin {
  settings: AutoRevealInExplorerSettings = DEFAULT_SETTINGS;
  private debouncedReveal: ReturnType<typeof createDebouncedReveal> | null = null;
  private expansionTracker = new ExpansionTracker();

  async onload(): Promise<void> {
    await this.loadSettings();

    this.rebuildDebouncedReveal();

    this.registerEvent(
      this.app.workspace.on("file-open", (file: TFile | null) => {
        if (file && this.settings.autoReveal && this.debouncedReveal) {
          this.debouncedReveal.reveal(file);
        } else if (!file && this.settings.autoReveal) {
          // All files closed — collapse all plugin-expanded folders
          collapseAllTrackedFolders(this.app, this.expansionTracker);
        }
      }),
    );

    this.addCommand({
      id: "reveal-active-file",
      name: "Reveal active file",
      callback: () => {
        const file = this.app.workspace.getActiveFile();
        if (file) {
          revealFileInExplorer(this.app, file);
        }
      },
    });

    this.addSettingTab(new AutoRevealInExplorerSettingTab(this.app, this));
  }

  onunload(): void {
    if (this.debouncedReveal) {
      this.debouncedReveal.cancel();
      this.debouncedReveal = null;
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.rebuildDebouncedReveal();
  }

  /**
   * Recreate the debounced reveal function with the current delay setting.
   * Called on load and whenever settings change.
   */
  private rebuildDebouncedReveal(): void {
    if (this.debouncedReveal) {
      this.debouncedReveal.cancel();
    }
    this.debouncedReveal = createDebouncedReveal(this.app, this.settings.revealDelay, this.expansionTracker, this.settings.excludedFolders);
  }
}

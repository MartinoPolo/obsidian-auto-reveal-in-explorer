import { Plugin, TFile } from "obsidian";
import { createDebouncedReveal } from "./reveal";
import {
  DEFAULT_SETTINGS,
  RevealInNavigationSettingTab,
  type RevealInNavigationSettings,
} from "./settings";

export default class RevealInNavigationPlugin extends Plugin {
  settings: RevealInNavigationSettings = DEFAULT_SETTINGS;
  private debouncedReveal: ReturnType<typeof createDebouncedReveal> | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.rebuildDebouncedReveal();

    this.registerEvent(
      this.app.workspace.on("file-open", (file: TFile | null) => {
        if (file && this.settings.autoReveal && this.debouncedReveal) {
          this.debouncedReveal.reveal(file);
        }
      }),
    );

    this.addSettingTab(new RevealInNavigationSettingTab(this.app, this));

    console.log("Reveal in Navigation: loaded");
  }

  onunload(): void {
    if (this.debouncedReveal) {
      this.debouncedReveal.cancel();
      this.debouncedReveal = null;
    }
    console.log("Reveal in Navigation: unloaded");
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
    this.debouncedReveal = createDebouncedReveal(this.app, this.settings.revealDelay);
  }
}

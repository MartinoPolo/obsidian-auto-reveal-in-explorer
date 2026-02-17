import { App, PluginSettingTab, Setting } from "obsidian";
import type AutoRevealInExplorerPlugin from "./main";

export interface AutoRevealInExplorerSettings {
  autoReveal: boolean;
  revealDelay: number;
  excludedFolders: string[];
}

export const DEFAULT_SETTINGS: AutoRevealInExplorerSettings = {
  autoReveal: true,
  revealDelay: 150,
  excludedFolders: [],
};

export class AutoRevealInExplorerSettingTab extends PluginSettingTab {
  plugin: AutoRevealInExplorerPlugin;

  constructor(app: App, plugin: AutoRevealInExplorerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Auto-reveal active file")
      .setDesc("Automatically reveal the active file in the file explorer when switching files.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoReveal)
          .onChange(async (value) => {
            this.plugin.settings.autoReveal = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Reveal delay")
      .setDesc("Debounce delay in milliseconds before revealing the file (50–1000).")
      .addSlider((slider) =>
        slider
          .setLimits(50, 1000, 10)
          .setValue(this.plugin.settings.revealDelay)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.revealDelay = value;
            await this.plugin.saveSettings();
          }),
      );

    // --- Excluded Folders ---

    new Setting(containerEl)
      .setName("Excluded folders")
      .setDesc("Folders listed here will not be auto-expanded during reveal. If an excluded folder is in a file's parent chain, the file will not be revealed.")
      .setHeading();

    const excludedListContainer = containerEl.createDiv("excluded-folders-list");
    this.renderExcludedFoldersList(excludedListContainer);

    let inputValue = "";
    new Setting(containerEl)
      .setName("Add excluded folder")
      .setDesc("Enter a folder path (e.g. \"templates\" or \"projects/archive\").")
      .addText((text) =>
        text
          .setPlaceholder("Folder/path")
          .onChange((value) => {
            inputValue = value;
          }),
      )
      .addButton((button) =>
        button
          .setButtonText("Add")
          .setCta()
          .onClick(async () => {
            const trimmed = inputValue.trim().replace(/\/+$/, "");
            if (!trimmed) {
              return;
            }
            if (this.plugin.settings.excludedFolders.includes(trimmed)) {
              return;
            }
            this.plugin.settings.excludedFolders.push(trimmed);
            await this.plugin.saveSettings();
            this.renderExcludedFoldersList(excludedListContainer);
            inputValue = "";
            // Re-render the whole tab to clear the text input
            this.display();
          }),
      );
  }

  private renderExcludedFoldersList(container: HTMLElement): void {
    container.empty();

    if (this.plugin.settings.excludedFolders.length === 0) {
      container.createEl("p", {
        text: "No excluded folders.",
        cls: "setting-item-description",
      });
      return;
    }

    for (const folderPath of this.plugin.settings.excludedFolders) {
      new Setting(container)
        .setName(folderPath)
        .addButton((button) =>
          button
            .setButtonText("Remove")
            .setWarning()
            .onClick(async () => {
              this.plugin.settings.excludedFolders =
                this.plugin.settings.excludedFolders.filter((path) => path !== folderPath);
              await this.plugin.saveSettings();
              this.renderExcludedFoldersList(container);
            }),
        );
    }
  }
}

import { App, PluginSettingTab, Setting } from "obsidian";
import type RevealInNavigationPlugin from "./main";

export interface RevealInNavigationSettings {
  autoReveal: boolean;
  revealDelay: number;
}

export const DEFAULT_SETTINGS: RevealInNavigationSettings = {
  autoReveal: true,
  revealDelay: 150,
};

export class RevealInNavigationSettingTab extends PluginSettingTab {
  plugin: RevealInNavigationPlugin;

  constructor(app: App, plugin: RevealInNavigationPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Auto-reveal active file")
      .setDesc("Automatically reveal the active file in the File Explorer when switching files.")
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
  }
}

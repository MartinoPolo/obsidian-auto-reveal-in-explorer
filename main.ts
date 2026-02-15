import { Plugin } from "obsidian";

export default class RevealInNavigationPlugin extends Plugin {
  async onload(): Promise<void> {
    console.log("Reveal in Navigation: loaded");
  }

  onunload(): void {
    console.log("Reveal in Navigation: unloaded");
  }
}

import { Plugin, TFile } from "obsidian";
import { createDebouncedReveal } from "./reveal";

export default class RevealInNavigationPlugin extends Plugin {
  private debouncedReveal: ReturnType<typeof createDebouncedReveal> | null = null;

  async onload(): Promise<void> {
    this.debouncedReveal = createDebouncedReveal(this.app, 150);

    this.registerEvent(
      this.app.workspace.on("file-open", (file: TFile | null) => {
        if (file && this.debouncedReveal) {
          this.debouncedReveal.reveal(file);
        }
      }),
    );

    console.log("Reveal in Navigation: loaded");
  }

  onunload(): void {
    if (this.debouncedReveal) {
      this.debouncedReveal.cancel();
      this.debouncedReveal = null;
    }
    console.log("Reveal in Navigation: unloaded");
  }
}

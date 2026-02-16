# Auto Reveal in Explorer

Obsidian plugin that automatically reveals the active file in the File Explorer sidebar when switching tabs or opening files — without transferring keyboard focus away from the editor.

## Problem

The existing [obsidian-reveal-active-file](https://github.com/shichongrui/obsidian-reveal-active-file) plugin uses Obsidian's built-in `file-explorer:reveal-active-file` command, which transfers focus to the File Explorer. This creates a race condition where pressing Delete immediately after switching files can accidentally delete the revealed file instead of editor content.

## Solution

This plugin directly manipulates the File Explorer view's tree to reveal files without transferring focus, keeping the keyboard context safely in the editor.

## Features

- Auto-reveal active file in File Explorer on file switch
- No keyboard focus transfer — editor stays focused
- Configurable debounce delay
- Manual reveal command
- Works on both desktop and mobile

## Installation

### For Development

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Symlink or copy the project folder to your Obsidian vault's plugins directory:
   ```bash
   # Example (adjust paths for your setup)
   ln -s /path/to/obsidian-plugin-auto-reveal-in-explorer /path/to/vault/.obsidian/plugins/auto-reveal-in-explorer
   ```
5. Reload Obsidian and enable the plugin in Settings → Community Plugins

### From Community Plugins

(Not yet published)

## Development

```bash
# Install dependencies
npm install

# Build once
npm run build

# Build and watch for changes
npm run dev
```

After building, reload Obsidian (Ctrl/Cmd+R in desktop app) to test changes.

## License

MIT

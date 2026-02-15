# Phase 1: Foundation

**Status:** Not Started
**Dependencies:** None

## Objective
Set up the Obsidian plugin project scaffold with build tooling and a minimal plugin that loads successfully.

## Scope
- Project configuration (package.json, tsconfig, esbuild)
- Plugin manifest
- Empty plugin class that loads/unloads
- Build pipeline

## Out of Scope
- Reveal logic, settings, commands

---

## Tasks

### Project Setup

- [x] Create package.json with dependencies and build scripts
  Dev dependencies: obsidian, @types/node, esbuild, typescript, builtin-modules. Scripts: build, dev.

- [x] Create tsconfig.json and esbuild.config.mjs
  TypeScript strict mode, ES2018 target, ESNext modules. esbuild: bundle to main.js, externalize obsidian.

### Plugin Scaffold

- [ ] Create manifest.json
  Plugin ID: reveal-in-navigation. Name: "Reveal in Navigation". Min app version: 1.0.0.

- [ ] Create main.ts with empty plugin class
  Extend Plugin, implement onload/onunload with console logs. Verify plugin loads in Obsidian.

### Dev Environment

- [ ] Symlink project folder into Obsidian plugins directory
  Run as Administrator: `mklink /D "C:\Users\snapy\OneDrive\Obsidian\ObsidianMP\.obsidian\plugins\reveal-in-navigation" "C:\_MP_projects\obsidian-plugin-reveal-in-navigation"`. Verify Obsidian sees the plugin in Settings → Community Plugins.

### Completion Criteria

- [ ] Project builds without errors (`npm run build` produces main.js)

---
Progress: 2/6 tasks complete

## Decisions
None

## Blockers
None

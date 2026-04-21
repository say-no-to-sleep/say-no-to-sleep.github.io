# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WatTheHex is a static educational web tool library for Waterloo ECE students. It is pure HTML, CSS, and vanilla JavaScript — no framework, no build step, no bundler, no package manager, no test harness. Three names coexist deliberately and should not be casually normalized:

- `WhatTheHex` — the local folder name
- `WatTheHex` — the product/UI name, global namespace, storage keys
- `say-no-to-sleep.github.io` — the Git remote name

## Running Locally

Serve any static file server from the repo root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The site also works by opening `index.html` directly from disk (`file://`).

**Verification is manual.** There is no test suite. Smoke-test affected pages in a browser after any runtime change — see the Manual Verification Checklist in `docs/AI_CODEBASE_GUIDE.md`.

## Architecture

### Shared globals, not modules

The repo uses `<script defer>` tags and global variables — no ES modules, no imports/exports. Script order matters:

- `aqua2.js` — Aqua-style UI controls (tabs, sliders, selects, progress bars, scrollbars); injects control CSS and attaches behavior to `.aqua-*` markup
- `storage.js` — IndexedDB wrapper at `window.WatTheHex.storage`; also applies `overflow-x: clip` as a side effect
- `tools.js` — tool registry at `window.WatTheHex.tools`
- `main.js` — populates `#home-highlights` on `index.html` and `#filters`/`#tool-grid` on `tools.html`

Dataset files for the autograder populate `globalThis.WatTheHex.project3Data/project4Data/project5Data` and must load before `tool.js`.

### Tool structure

Each tool lives in `tools/<tool-name>/` and is self-contained:

```
tools/<tool-name>/
  index.html        # always present
  tool.css          # optional, tool-local styles
  tool.js           # optional, tool-local logic
  [data files]      # optional (autograder only)
```

Tool pages load shared assets in this order:
1. `../../style.css`
2. `../../aqua2.js`
3. `../../storage.js`
4. Optional: KaTeX CSS + JS + `../../assets/render-katex.js`
5. Optional: local `tool.css`
6. Optional: local `tool.js`

Tool pages also include an inline `file://` fallback script at the bottom that rewrites root-relative links for local file access.

### Tool registry (`tools.js`)

Every visible tool needs an entry:

```js
{
  name: "Sorting Visualizer",
  description: "...",
  course: "ECE 250",
  type: "Visualizer",
  term: "2A",             // parsed as /^(\d+)([AB])$/i for sorting
  date: "2026-03-17",     // ISO date, drives "newest" ordering
  url: "tools/sorting-visualizer/index.html"
}
```

`main.js` hard-codes `course`, `type`, and `term` as filter keys — changing these field names breaks filters immediately.

### Math rendering (KaTeX)

Use `data-katex="<expression>"` on elements with readable fallback text content. Only load KaTeX on pages that actually need it.

## CSS Conventions

- Shared styles → `style.css`
- Tool-local styles → `tools/<name>/tool.css`
- Prefix classes by context to avoid collisions: `home-`, `tools-`, `sort-`, `conv-`, `am-`, `gpio-`, `autograder-`, etc.
- Never add unprefixed generic classes (`.panel`, `.button`, `.card`) in tool-local CSS
- Use Aqua controls via `.aqua-*` markup; customize inside a scoped class rather than replacing them

## JavaScript Conventions

- 2-space indentation, semicolons, `const`-first
- IIFEs with `"use strict"` for self-contained files
- `function` declarations over arrow functions for named reusable logic
- Tool scripts organize as: constants → `state` → `refs` → `init()` → event handlers → render/utility helpers
- Cache DOM nodes in `refs`, don't query repeatedly
- Escape dynamic content explicitly before injecting via `innerHTML`
- Guard `init()` against pages where the required mount nodes don't exist

## Adding a New Tool

1. Copy `tools/tool-template/index.html` and replace all placeholder values (breadcrumb, title, description, footer chips)
2. Add `tool.css` and `tool.js` as needed
3. Add an entry to `tools.js`
4. Manually verify: page loads directly, appears on `tools.html`, home ordering is correct, links work under hosted and `file://` paths, keyboard and mobile work

## What Not to Touch Casually

- `assets/vendor/katex/` — vendored third-party, treat as read-only
- `assets/fonts/` — binary assets
- `aqua2.js` — shared control system; any change affects every page
- Shared tokens and layout in `style.css` — wide blast radius
- Autograder dataset shape — `tool.js` assumes the exact contract
- Tool registry keys in `tools.js` — `main.js` depends on them directly

## Known Debt (don't silently normalize)

- `tools/autograder-reverse-engineering/` keeps styles in `style.css` instead of a local `tool.css`
- `storage.js` mixes persistence logic with overflow clipping
- `tools/tool-template/` still contains Red-Black Tree placeholder text
- Some tools use cache-busting query params on `tool.js` (`?v=20260318`); others don't

For deeper reference, see `docs/AI_CODEBASE_GUIDE.md`.

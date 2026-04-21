# AI Codebase Guide for WatTheHex

Snapshot date: 2026-04-06

This document is the fastest way for an engineer or AI agent to catch up on this repository and make changes without breaking the existing style or structure. It is intentionally dense. Treat it as the source of truth for repo layout, runtime assumptions, extension contracts, and contribution conventions.

## Fast Orientation

Three names are currently in use:

- `WhatTheHex`: the local repository folder name.
- `WatTheHex`: the product/site branding used in HTML titles, visible UI text, and the global namespace.
- `say-no-to-sleep.github.io`: the Git remote and the current minimal `README.md` heading, reflecting older repo history rather than the current product name.

Practical rule: do not "fix" these names casually. They are inconsistent today, but they are wired into branding, storage keys, and repo history. Call the mismatch out in docs and code review before normalizing it.

High-level mental model:

- This is a static site made of hand-written HTML, CSS, and vanilla JavaScript.
- There is no framework, no build step, no bundler, no package manager, no transpiler, and no automated test harness in the repo.
- Pages load shared global scripts with `<script ... defer>` and then optional page/tool-specific scripts.
- Tool pages are mostly self-contained mini-apps inside `tools/<tool-name>/`.
- Shared visual language comes from `style.css` plus the in-repo `aqua2.js` UI foundation.

## Runtime Model

### What exists

- Plain static HTML pages at the repo root and under `tools/`.
- Shared scripts loaded directly by script tag:
  - `aqua2.js`
  - `storage.js`
  - `tools.js`
  - `main.js`
  - `assets/render-katex.js` on math-heavy pages
- Vendored KaTeX assets under `assets/vendor/katex/`.
- Local font assets under `assets/fonts/`.

### What does not exist

As of 2026-04-06, the repo does not contain:

- `package.json`
- lockfiles
- TypeScript config
- ESLint config
- Prettier config
- bundler config
- framework config
- CI-oriented test config

### Execution model

- The site is browser-first and can be opened directly from disk or served by any static file server.
- Root pages use normal relative paths such as `index.html`, `tools.html`, and `about.html`.
- Tool pages are written for hosted root paths like `/tools.html`, but they also include a repeated inline fallback script that rewrites those links to `../../index.html`, `../../tools.html`, and `../../about.html` when `window.location.protocol === "file:"`.
- Script order matters because there is no module loader:
  - shared globals must be loaded before consumers
  - dataset files must load before the tool that reads them
  - KaTeX must load before `assets/render-katex.js`

### Verification model

- There is no automated test suite.
- Verification is manual: open pages, use controls, test keyboard interaction, check responsive breakpoints, and make sure direct navigation and `file://` access still work where expected.

## Repo Map

### Top-level runtime files

| Path | Role |
| --- | --- |
| `index.html` | Home page. Shared shell plus "Newly Added" cards. |
| `tools.html` | Tool directory page with filter UI. |
| `about.html` | Static about page describing fonts and Aqua2. |
| `style.css` | Shared site stylesheet. Defines fonts, tokens, page shell, shared panels, home/tools/about styles, shared tool page shell, and autograder styles. |
| `aqua2.js` | Large shared Aqua-style UI foundation. Injects control CSS and attaches behavior for tabs, selects, sliders, progress bars, and scrollbars. |
| `storage.js` | Shared IndexedDB wrapper exposed as `window.WatTheHex.storage`. Also reapplies viewport `overflow-x: clip`, so it has visual side effects in addition to storage. |
| `tools.js` | Registry of tool metadata used across the site. |
| `main.js` | Shared behavior for the home page and tools page. Builds filters, tool cards, and home highlights from `window.WatTheHex.tools`. |

### Runtime directories

| Path | Role |
| --- | --- |
| `tools/` | One subdirectory per tool or template. |
| `assets/vendor/katex/` | Vendored KaTeX CSS, JS, and fonts. Treat as third-party code. |
| `assets/fonts/` | Local font files for Lucida Grande and Andale Mono. Treat as binary assets, not normal source. |
| `assets/render-katex.js` | Tiny enhancement script that renders nodes with `data-katex`. |

### Non-runtime / local project files

| Path | Role |
| --- | --- |
| `README.md` | Currently minimal and not useful as a technical onboarding source. |
| `skills/aqua-web-style/SKILL.md` | Unfinished local skill scaffold with TODO text. Not a source of truth yet. |
| `.claude/` | Local editor/assistant configuration, not part of site runtime. |

## Root Page Responsibilities

### `index.html`

- Loads `style.css`, `aqua2.js`, `storage.js`, `tools.js`, and `main.js`.
- Uses the shared top navigation shell.
- Contains the `#home-highlights` mount point.
- `main.js` fills the "Newly Added" section using the newest four entries from `window.WatTheHex.tools`, sorted by `date` descending.

### `tools.html`

- Loads the same shared assets as `index.html`.
- Contains the `#filters` and `#tool-grid` mount points.
- `main.js` builds filter pills from the tool registry and syncs selected filters into the query string via repeated `course`, `type`, and `term` params.

### `about.html`

- Loads `style.css`, `aqua2.js`, and `storage.js`.
- Does not load `tools.js` or `main.js`.
- Purely content-oriented. Safe place to add static explanatory copy, but not used for tool discovery or application state.

## Shared Architecture

### Global namespace contract

The repo uses globals, not modules.

- `window.WatTheHex.tools` is the site-wide tool registry.
- `window.WatTheHex.storage` is the shared storage API.
- `globalThis.WatTheHex.project3Data`, `project4Data`, and `project5Data` are populated by autograder dataset files before the autograder tool initializes.

If you add new cross-page data or services, follow the same pattern deliberately. Do not mix module syntax into a single page while the rest of the repo still depends on globals.

### Tool registry contract: `tools.js`

Each visible tool is registered in `window.WatTheHex.tools` as an object with this shape:

```js
{
  name: "Sorting Visualizer",
  description: "Step through lecture-faithful sorting algorithms...",
  course: "ECE 250",
  type: "Visualizer",
  term: "2A",
  date: "2026-03-17",
  url: "tools/sorting-visualizer/index.html"
}
```

Field semantics:

- `name`: shown directly in cards and home highlights.
- `description`: shown directly in cards and home highlights.
- `course`: used both as visible metadata and as a filter value.
- `type`: used both as visible metadata and as a filter value.
- `term`: used both as visible metadata and as a filter value.
- `date`: must be parseable by `Date.parse`. Use `YYYY-MM-DD`. It drives "newest" sorting.
- `url`: repo-relative URL from the site root.

Important hidden contracts:

- `main.js` expects `course`, `type`, and `term` to exist because those keys are hard-coded in `filterConfig`.
- `term` sorting is optimized for values like `2A`, `2B`, `3A`, etc. `main.js` parses `/^(\d+)([AB])$/i`; anything else sorts last.
- Changing field names will break filters and highlights immediately.

### Shared storage contract: `storage.js`

`storage.js` exposes:

- `init()`
- `get(key)`
- `set(key, value)`
- `remove(key)`
- `list(prefix = "")`

Behavior notes:

- It uses IndexedDB database name `watthehex`, version `1`, with object store `entries`.
- Entries are stored under `{ key, value, updatedAt }`.
- The API is Promise-based.
- The storage API is loaded on nearly every page but is barely used by current runtime code.
- `storage.js` also contains overflow clipping logic, so it is not a pure persistence helper.

Practical rule: if you need lightweight persistence, prefer this wrapper over inventing a second IndexedDB abstraction. If you only need one tiny page-specific preference and the page already uses `localStorage` safely, keep the decision explicit and document it.

### Shared site behavior contract: `main.js`

`main.js` is intentionally written to run on more than one page.

- On the home page it populates `#home-highlights`.
- On the tools page it populates `#filters` and `#tool-grid`.
- It safely no-ops when expected mount nodes do not exist.

Do not refactor `main.js` into a page-specific script unless you are also restructuring page loading. The current contract is "one shared script, multiple optional mount points."

### Aqua UI contract: `aqua2.js`

`aqua2.js` is the shared control system for:

- buttons
- radios
- checkboxes
- inputs
- selects
- sliders
- progress indicators
- scrollbars
- tab views

What it does:

- injects a large block of control CSS into the page
- scans the DOM for `.aqua-*` structures
- attaches behavior to known control markup

What this means for future changes:

- Use existing Aqua class structures instead of inventing a parallel control system for routine controls.
- Tool-local CSS is expected to restyle or scope Aqua controls, not replace them wholesale.
- Only edit `aqua2.js` when the change is truly cross-site or control-system-level.
- If you change `aqua2.js`, retest every page that uses Aqua tabs, selects, sliders, or progress bars.

### KaTeX contract

Math-heavy tools load:

- `../../assets/vendor/katex/dist/katex.min.css`
- `../../assets/vendor/katex/dist/katex.min.js`
- `../../assets/render-katex.js`

`assets/render-katex.js` finds `[data-katex]` nodes and renders them in place, leaving fallback text when rendering fails.

Practical rule:

- Keep readable fallback text content in the HTML.
- Put the KaTeX expression in `data-katex`.
- Only load KaTeX on pages that actually need it.

## Per-Tool Folder Contract

The expected tool directory structure is:

- `tools/<tool-name>/index.html`
- optional `tool.css`
- optional `tool.js`
- optional extra data files

Common expectations for `index.html`:

- shared site header/top bar
- tool breadcrumb
- tool intro section with title and description
- main tool content area
- footer chips linking back to `tools.html?course=...` and `tools.html?term=...`
- inline `file://` fallback script at the bottom for root-style links

Shared asset pattern for most tools:

- `../../style.css`
- `../../aqua2.js`
- `../../storage.js`
- optional KaTeX assets
- optional local `tool.css`
- optional local `tool.js`

Practical rule:

- If a new tool is user-facing, it almost certainly belongs in its own folder under `tools/`.
- If the tool is meant to appear on the site, add it to `tools.js`.
- If the tool is scaffolding only, keep it out of `tools.js`.

## Tool Inventory

### `tools/sorting-visualizer/`

Purpose:

- The largest and most complex tool in the repo.
- Visualizes multiple sorting families and algorithms for ECE 250.

Files:

- `index.html`
- `tool.css`
- `tool.js`

Implementation notes:

- Uses KaTeX.
- Uses custom Aqua tab, select, slider, and progress UI.
- Uses SVG-heavy rendering and a large amount of precomputed metadata.
- Uses `state`, `refs`, `init()`, render helpers, animation helpers, and accessibility state updates.
- Includes reduced-motion handling via `matchMedia("(prefers-reduced-motion: reduce)")`.
- Has an early hidden/loading reveal pattern to avoid showing a half-initialized UI.

Extension notes:

- This is the reference implementation for a large, fully custom tool page.
- Copy structure and discipline from here, not necessarily raw complexity.

### `tools/convolution-visualizer/`

Purpose:

- Interactive signal-convolution visualizer for ECE 205.

Files:

- `index.html`
- `tool.css`
- `tool.js`

Implementation notes:

- Uses KaTeX.
- Uses SVG rendering and a custom expression parser/evaluator flow.
- Uses Aqua sliders plus interactive pointer dragging on the overlap plot.
- Binds `DOMContentLoaded` inside the tool script.
- Includes a cache-busted script reference: `tool.js?v=20260318`.

Extension notes:

- Good reference for math input, manual SVG generation, and scoped tool styling.

### `tools/am-envelope-visualizer/`

Purpose:

- Visualizes the AM signal chain and envelope detector behavior for ECE 240.

Files:

- `index.html`
- `tool.css`
- `tool.js`

Implementation notes:

- Uses KaTeX.
- Uses `<canvas>` rendering rather than SVG.
- Uses Aqua sliders with custom value formatting and `ResizeObserver`-driven rerendering.
- Includes sticky/compact summary behavior for smaller viewports.
- Includes a cache-busted script reference: `tool.js?v=20260318`.

Extension notes:

- Good reference for canvas-based tool rendering and compact responsive status UIs.

### `tools/gpio-calculator/`

Purpose:

- Bitmask builder for GPIO-related coursework.

Files:

- `index.html`
- `tool.css`
- `tool.js`

Implementation notes:

- Builds much of its UI via markup strings and `innerHTML`.
- Uses Aqua checkboxes and buttons.
- Has a strong mobile adaptation layer: compact summary, slide-up action tray, backdrop, toast, and `matchMedia` checks.
- Uses no KaTeX.

Extension notes:

- Good reference for dynamic markup generation, bit-level state transforms, and mobile-first utility interactions.

### `tools/autograder-reverse-engineering/`

Purpose:

- Reverse-engineering/diagnostic tool for ECE 250 autograder behavior.

Files:

- `index.html`
- `tool.js`
- `project3-data.js`
- `project4-data.js`
- `project5-data.js`

Implementation notes:

- No dedicated `tool.css`; styles live in `style.css`.
- Dataset files populate `globalThis.WatTheHex.project3Data`, `project4Data`, and `project5Data` before the main tool script runs.
- `tool.js` is built around pure helper functions plus `createAutograderAnalyzer(...)`.
- Uses `localStorage` key `watthehex.autograder.activeTab` for tab persistence instead of `storage.js`.
- Uses markup-string rendering and explicit `escapeHtml(...)` when injecting dynamic text.

Autograder dataset contract:

```js
{
  TEST_COMMANDS: { 1: ["LOAD_P3"], ... },
  TEST_NOTES: { 11: [{ text: "...", source: "..." }], ... },
  CONTRIBUTORS: ["@handle", ...],
  KNOWN_EDGE_CASES: [
    {
      affectedTests: [7, 8, 9],
      command: "FIND_P3",
      source: "@user",
      input: "BUILD_P3 ...",
      description: "..."
    }
  ],
  COMMAND_INFO: {
    LOAD_P3: { description: "..." }
  },
  NEVER_TESTED: ["COMMAND_NAME", ...]
}
```

Practical rule:

- If you add or modify autograder data, keep that shape exact.
- Load new dataset files before `tool.js` in `index.html`.

### `tools/red-black-tree-visualizer/`

Purpose:

- Placeholder page for a future tool.

Files:

- `index.html`

Implementation notes:

- No local CSS.
- No local JS.
- Shows an "Under Construction" state using shared styles and an Aqua indeterminate progress indicator.
- Still appears in `tools.js`, so users can navigate to it from the directory.

Practical rule:

- If you build this tool out, decide whether to follow the standard `index.html` + `tool.css` + `tool.js` pattern and then update this guide.

### `tools/tool-template/`

Purpose:

- Starter scaffold for new tools.

Files:

- `index.html`

Important warning:

- The template still contains Red-Black Tree placeholder copy in the breadcrumb, title, and description.
- It is a structural starting point, not a drop-in generic template yet.

Practical rule:

- Replace all placeholder course/title/description/footer values before using it as the base of a new tool.

## Coding and Style Conventions

### JavaScript conventions

Observed repo conventions for repo-authored JS:

- IIFEs are common for self-contained files.
- `"use strict";` is common inside IIFEs.
- `const`-first declarations are the norm.
- function declarations are preferred over arrow functions for named reusable logic.
- semicolons are used consistently.
- indentation is 2 spaces.
- code is written for direct browser execution, not module bundling.

Recommended style for future JS:

- Start tool scripts with constants, then `state`, then `refs`, then `init()`, then event handlers, then render and utility helpers.
- Cache DOM nodes in `refs` instead of repeatedly querying them.
- Guard `init()` by checking required nodes and returning early if the page is not the intended mount.
- Keep state in plain objects; do not invent a framework-like state layer.
- Prefer small pure helpers for calculations and string formatting.
- When generating HTML strings and injecting them with `innerHTML`, escape dynamic content explicitly.
- Use `requestAnimationFrame` for render throttling or smooth visual updates.

Patterns already present:

- `main.js` favors direct DOM creation via `document.createElement`.
- `gpio` and `autograder` favor string markup plus `innerHTML`.
- `sorting`, `convolution`, and `am` lean toward structured state/render pipelines.

Do not force all files into one rendering style if the existing page already has a clear pattern. Preserve the local pattern unless there is a strong reason to change it.

### HTML conventions

- Use semantic sections with clear headings.
- Use `aria-labelledby`, `aria-live`, `aria-current`, `role`, and `aria-*` attributes intentionally.
- Keep page shells consistent: header, breadcrumb, intro, main content, footer chips.
- Load shared assets with `defer`.
- Keep tool-page local-link fallback scripts at the bottom of the page.
- Do not introduce framework mounting conventions like a single opaque root div unless the whole page is being redesigned around that model.

### CSS conventions

- Shared site/page styling belongs in `style.css`.
- Tool-local styling belongs in that tool's `tool.css`.
- Prefix classes by page or tool to avoid collisions.

Current prefixes include:

- `home-`
- `tools-`
- `content-`
- `about-`
- `sort-`
- `conv-`
- `am-`
- `gpio-`
- `autograder-`

Recommended rules:

- Do not add generic classes like `.panel`, `.button`, or `.card` without a prefix in tool-local CSS.
- Reuse shared CSS custom properties where it makes sense.
- Use handwritten media queries for responsiveness.
- Preserve the Aqua-era visual direction: glassy gradients, beveled controls, soft panels, expressive typography, and visible depth.
- Prefer customizing Aqua controls inside a scoped tool class instead of redefining a second unrelated control system.

### Accessibility conventions

Accessibility is not accidental in this repo. Preserve it.

Existing patterns to keep:

- keyboard-operable sliders
- tabs with `aria-selected`
- live regions for dynamic status
- explicit labels for custom controls
- `role="img"` and `aria-label` for generated SVGs
- reduced-motion support where motion is substantial

If you add a custom control, match the accessibility bar already present in the larger tools.

### Responsive conventions

- Responsiveness is handled by manual breakpoints in CSS, not layout libraries.
- Larger tools often use sticky control rails on desktop and stacked/compact layouts on smaller screens.
- Some pages add floating summaries or mobile trays instead of shrinking dense UI beyond usability.

Practical rule:

- Optimize for both desktop and mobile, but do it with page-specific CSS and state, not a global abstraction layer.

## How to Add a New Tool

1. Start from `tools/tool-template/index.html`.
2. Replace every placeholder detail:
   - page title
   - breadcrumb text
   - intro title/description
   - footer chips and query links
3. Decide whether the tool needs local `tool.css`, local `tool.js`, both, or neither.
4. Keep the shared header, breadcrumb, intro, footer, and `file://` fallback script unless there is a deliberate site-wide redesign.
5. Load shared assets in the usual order:
   - `../../style.css`
   - `../../aqua2.js`
   - `../../storage.js`
   - optional third-party assets
   - optional local CSS
   - optional local JS
6. If the tool needs formulas, load KaTeX and use `data-katex` plus readable fallback text.
7. If the tool is meant to appear on the site, add a new entry to `tools.js`.
8. In that `tools.js` entry:
   - use a parseable ISO date
   - keep `term` in the repo's sortable format like `2A`
   - keep `url` repo-relative from site root
9. If the tool introduces shared styles or shared behavior, prefer editing `style.css` or another shared runtime file only when the change truly applies across pages.
10. Manually verify:
    - the new page loads directly
    - the tool appears on `tools.html`
    - the home page ordering is correct if the new `date` makes it "new"
    - root links work under hosted paths and `file://`
    - keyboard and mobile behavior are acceptable

## Known Inconsistencies and Local Debt

These are real and should be understood before refactoring:

- Repository folder name: `WhatTheHex`
- Product/UI/global name: `WatTheHex`
- Remote/README history: `say-no-to-sleep.github.io`
- IndexedDB and localStorage keys use lowercase `watthehex`
- `README.md` is effectively empty as a technical guide
- `skills/aqua-web-style/SKILL.md` is unfinished and contains TODO scaffold text
- `tools/red-black-tree-visualizer/` is still a placeholder but is listed in `tools.js`
- `tools/tool-template/` is not fully generic yet and still contains Red-Black placeholder text
- `tools/am-envelope-visualizer/index.html` and `tools/convolution-visualizer/index.html` use cache-busting query params on `tool.js`; other tools do not
- `tools/autograder-reverse-engineering/` keeps styles in `style.css` instead of a local `tool.css`
- `storage.js` contains both persistence logic and visual overflow clipping

Do not silently normalize these in unrelated work. If you want to clean them up, make that a dedicated change.

## Files to Read First

### For site-wide navigation or tool discovery work

Read in this order:

1. `tools.js`
2. `main.js`
3. `index.html`
4. `tools.html`
5. `style.css`

### For work on one specific tool

Read in this order:

1. `tools/<tool-name>/index.html`
2. `tools/<tool-name>/tool.js` if it exists
3. `tools/<tool-name>/tool.css` if it exists
4. `style.css`
5. `aqua2.js` only if you need to understand or change shared control behavior

### For autograder work

Read in this order:

1. `tools/autograder-reverse-engineering/index.html`
2. `tools/autograder-reverse-engineering/tool.js`
3. the relevant dataset file(s)
4. the autograder sections inside `style.css`

## What Not to Touch Casually

- `assets/vendor/katex/`: vendored third-party code
- `assets/fonts/`: binary assets
- `aqua2.js`: shared control system with cross-site blast radius
- shared tokens/layout in `style.css`: small changes can affect every page
- data shape in autograder dataset files: `tool.js` assumes the current contract
- tool registry keys in `tools.js`: `main.js` depends on them directly

## Manual Verification Checklist

When you change runtime code, manually smoke-test the relevant pages:

- `index.html`
- `tools.html`
- `about.html` if shared shell/styles changed
- the edited tool page directly
- mobile-width layout for dense tools
- keyboard interaction for custom sliders/selects/toggles
- `file://` navigation on tool pages if link logic changed

Also re-check:

- home highlights still render
- tools filter pills still work
- breadcrumb and footer links still point to the right place
- KaTeX formulas still render if the page uses them

## When to Update This Guide

Update this file when any of the following changes:

- a new user-facing tool is added or removed
- a tool directory changes structure in a meaningful way
- `tools.js` metadata shape changes
- shared globals under `window.WatTheHex` change
- `storage.js` API changes
- `aqua2.js` markup/behavior contracts change
- the repo adopts a build step, framework, package manager, or automated tests
- the naming mismatch is intentionally normalized

If a future change makes any section here inaccurate, update this guide in the same PR/change set. This document is only useful if it stays synchronized with the live repo.

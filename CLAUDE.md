# CLAUDE.md

Personal website for Jinyuan (Eugene) Zhao: portfolio plus a project-update log. Jekyll site, built by GitHub Pages (`say-no-to-sleep.github.io`). Theme: LCARS Picard v27 from TheLCARS.com.

- `_layouts/default.html` holds the whole LCARS frame. Pages and posts only supply the content of `<main>`.
- Site labels are themed: posts are "logs" (`/logs/`), projects are "missions" (URL stays `/projects/`).
- Sidebar console (`_includes/nav-model.html`, `initKeypad` in `site.js`): every page has an ID `xx-xxxx`, shown in the `panel-3` block. `01-0000` comms, `02-0000` missions, `03-0000` logs; missions are `02-0001`, `02-0002`... and logs `03-0001`... by age, oldest first (inserting an older entry shifts the later IDs); a `code` in front matter overrides. Stardates (header, live in `updateStardate`; log dates via `_includes/stardate.html`) are TNG's formula with the year +400, so 2026 is 2426. Typing an ID on the keypad (or keyboard) and pressing `•`/`.` opens it. The three keypad panels are parent, previous (older) and next (newer). The `panel-8` list shows the section's entries (8 max); `unlisted: true` hides a page from the list but keeps its ID typeable.
- Posts are Markdown in `_posts/YYYY-MM-DD-slug.md` with `title` and optional `project` front matter. `project` is the project file path (`_projects/resistor-sorter.md`), which is what the Pages CMS reference field stores; `_includes/project-link.html` resolves it. Any other value (a project with no mission page yet) shows as plain text.
- Projects (`_projects/`) are a Markdown collection using `_layouts/entry.html`, with `title`, `dates`, `details`, and `summary`. Mission lists run newest first by start date (the first month and year in `dates`), the same order as their IDs. Project pages list posts whose `project` matches. Images live in `assets/projects/<slug>/`; post images in `assets/posts/`.
- The home page body is `index.md` (About, Skills, Links); `_layouts/home.html` adds the project list and latest posts.
- Image captions: a paragraph followed by `{: .caption}`.
- Theme elements in use: home-page `##` headings (and fixed labels like "Project updates") render as `lcars-text-bar`; keep them short, the bar doesn't wrap, so long post/mission headings stay plain h2s. Posts end with an "End log" `the-end` text bar and `---` becomes `hr.lcars-bar`. Bullet colors per item: `- {: .bullet-blue} text`. A mission whose `dates` contains "present" gets a blinking "in progress" tag.
- Videos: raw `<video controls>` HTML in the Markdown. `site.js` frames it and swaps the native controls for LCARS ones; size classes go on the frame, never as fixed image widths (those overflow narrow screens).
- `site.css`/`site.js` links carry a build-time `?v=` stamp so browsers don't keep stale copies.
- Post images: a Markdown image alone in its paragraph is wrapped in the LCARS frame by `assets/site.js`; its Markdown title becomes the frame title. Sizes: `{: .small}`, `{: .medium}`, `{: .large}` after the image; `{: .plain}` skips the frame. Images on consecutive lines (one paragraph) become a side-by-side row that wraps on narrow screens. The `frame.html` include does the same in Liquid.
- `.pages.yml` configures Pages CMS, the browser editor for posts.
- Theme component markup and class names: `docs/lcars-components.md`.
- `assets/picard.css` is the vendor theme. Put site changes in `assets/site.css`, not in it.
- Keep the TheLCARS.com credit link ("with modifications") and the trademark lines in the footer; the theme license requires them. Never hotlink thelcars.com files.
- `legacy/` is the old WatTheHex site, gitignored, kept for reference only. Don't edit it.

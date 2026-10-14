# CLAUDE.md

Personal website for Jinyuan (Eugene) Zhao: portfolio plus a project-update blog. Jekyll site, built by GitHub Pages (`say-no-to-sleep.github.io`). Theme: LCARS Picard v27 from TheLCARS.com.

- `_layouts/default.html` holds the whole LCARS frame. Pages and posts only supply the content of `<main>`.
- Posts are Markdown in `_posts/YYYY-MM-DD-slug.md` with `title` and optional `project` front matter. `project` is the project file path (`_projects/resistor-sorter.md`), which is what the Pages CMS reference field stores; `_includes/project-link.html` resolves it.
- Projects (`_projects/`) are a Markdown collection using `_layouts/entry.html`, with `title`, `dates`, `details`, `summary` and `order` (1 = top). Project pages list posts whose `project` matches. Images live in `assets/projects/<slug>/`; post images in `assets/posts/`.
- The home page body is `index.md` (About, Skills, Links); `_layouts/home.html` adds the project list and latest posts.
- Image captions: a paragraph followed by `{: .caption}`.
- Videos: raw `<video controls>` HTML in the Markdown. `site.js` frames it and swaps the native controls for LCARS ones; size classes go on the frame, never as fixed image widths (those overflow narrow screens).
- `site.css`/`site.js` links carry a build-time `?v=` stamp so browsers don't keep stale copies.
- Post images: a Markdown image alone in its paragraph is wrapped in the LCARS frame by `assets/site.js`; its Markdown title becomes the frame title. Sizes: `{: .small}`, `{: .medium}`, `{: .large}` after the image; `{: .plain}` skips the frame. Images on consecutive lines (one paragraph) become a side-by-side row that wraps on narrow screens. The `frame.html` include does the same in Liquid.
- `.pages.yml` configures Pages CMS, the browser editor for posts.
- Theme component markup and class names: `docs/lcars-components.md`.
- `assets/picard.css` is the vendor theme. Put site changes in `assets/site.css`, not in it.
- Keep the TheLCARS.com credit link ("with modifications") and the trademark lines in the footer; the theme license requires them. Never hotlink thelcars.com files.
- `legacy/` is the old WatTheHex site, gitignored, kept for reference only. Don't edit it.

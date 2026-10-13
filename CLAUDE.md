# CLAUDE.md

Personal website for Jinyuan (Eugene) Zhao: portfolio plus a project-update blog. Jekyll site, built by GitHub Pages (`say-no-to-sleep.github.io`). Theme: LCARS Picard v27 from TheLCARS.com.

- `_layouts/default.html` holds the whole LCARS frame. Pages and posts only supply the content of `<main>`.
- Posts are Markdown in `_posts/YYYY-MM-DD-slug.md` with `title` and optional `project` front matter. Post images live in `assets/posts/`.
- Framed images: `{% include frame.html src="..." alt="..." title="..." %}`.
- `.pages.yml` configures Pages CMS, the browser editor for posts.
- Theme component markup and class names: `docs/lcars-components.md`.
- `assets/picard.css` is the vendor theme. Put site changes in `assets/site.css`, not in it.
- Keep the TheLCARS.com credit link ("with modifications") and the trademark lines in the footer; the theme license requires them. Never hotlink thelcars.com files.
- `legacy/` is the old WatTheHex site, gitignored, kept for reference only. Don't edit it.

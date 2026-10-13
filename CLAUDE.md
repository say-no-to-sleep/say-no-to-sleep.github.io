# CLAUDE.md

Personal website for Jinyuan (Eugene) Zhao: portfolio plus a project-update blog. Jekyll site, built by GitHub Pages (`say-no-to-sleep.github.io`). Theme: LCARS Picard v27 from TheLCARS.com.

- `_layouts/default.html` holds the whole LCARS frame. Pages and posts only supply the content of `<main>`.
- Posts are Markdown in `_posts/YYYY-MM-DD-slug.md` with `title` and optional `project` front matter. Post images live in `assets/posts/`.
- Post images: a Markdown image alone in its paragraph is wrapped in the LCARS frame by `assets/site.js`; its Markdown title becomes the frame title. Sizes: `{: .small}`, `{: .medium}`, `{: .large}` after the image; `{: .plain}` skips the frame. The `frame.html` include does the same in Liquid.
- `.pages.yml` configures Pages CMS, the browser editor for posts.
- Theme component markup and class names: `docs/lcars-components.md`.
- `assets/picard.css` is the vendor theme. Put site changes in `assets/site.css`, not in it.
- Keep the TheLCARS.com credit link ("with modifications") and the trademark lines in the footer; the theme license requires them. Never hotlink thelcars.com files.
- `legacy/` is the old WatTheHex site, gitignored, kept for reference only. Don't edit it.

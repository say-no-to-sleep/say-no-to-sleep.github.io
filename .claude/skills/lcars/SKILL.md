---
name: lcars
description: TheLCARS.com theme guides (buttons, Picard buttons, sidebar/panel buttons, colors, fonts, HTML elements, LCARS bar, text bar, blinkies, image frame, image alignment/borders, 2-column flex layout, v27 changelog, license). Use when adding or changing LCARS markup, classes or styling on this site.
---

# LCARS theme guides

Full text of every guide page on thelcars.com, scraped 2026-10-13 (theme v27). This site uses the **Picard** theme; guides written for the Classic theme mostly apply, but use Picard class names and colors where they differ.

Start with `docs/lcars-components.md` (this site's short reference) and `CLAUDE.md`. Open a reference below only for what that doesn't cover.

| Need | Reference |
|---|---|
| Picard buttons: standard, flatside, pill, rows, columns, layout | `references/picard-buttons.md` |
| Classic buttons, `justify-*` layout classes, blinking button | `references/buttons.md` |
| Sidebar nav buttons | `references/sidebar-buttons.md` |
| Sidebar panels as buttons (`panel-button`) | `references/panel-buttons.md` |
| Color names and hex for every theme (Picard section near the end) | `references/colors.md` |
| Fonts (Antonio) | `references/fonts.md` |
| Lists, bullet colors, `<hr>`, LCARS bar, blockquote, blink/alert classes | `references/html-elements.md` |
| Text bar | `references/text-bar.md` |
| Image frame | `references/image-frame.md` |
| Images: general, left, right, centered, bordered | `references/images*.md` |
| 2-column flex layout | `references/flex.md` |
| What changed in v27 (Picard CSS details) | `references/changelog-v27.md` |
| Download / included themes | `references/download.md` |
| License and attribution rules | `references/license.md` |

Site rules that override the guides:
- Put changes in `assets/site.css`, never `assets/picard.css`.
- Never hotlink thelcars.com files; keep the footer credit ("with modifications") and trademark lines.
- Sounds go through `playSoundAndRedirect(audioId, url)` in `assets/site.js`.

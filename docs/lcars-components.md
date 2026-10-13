# LCARS Picard theme: component reference

Notes taken from TheLCARS.com docs (Picard theme v27) on 2026-10-13. Sources:
[picard-buttons](https://www.thelcars.com/picard-buttons.html),
[image-frame](https://www.thelcars.com/image-frame.php),
[html-elements](https://www.thelcars.com/html-elements.php),
[images](https://www.thelcars.com/images/),
[sidebar-buttons](https://www.thelcars.com/sidebar-buttons.php),
[panel-buttons](https://www.thelcars.com/panel-buttons.php).

License ([EULA](https://www.thelcars.com/license/)): personal, non-commercial use is allowed. Credit TheLCARS.com with a link, note "with modifications", and don't hotlink their files.

In this site, `playSoundAndRedirect(audioId, url)` lives in `assets/site.js`. An empty `url` only plays the sound. Sounds are `audio1`–`audio4` (beeps) and `audio5` (Picard key).

## Buttons

Single buttons: `lcars-button` (standard), `flatside-button`, `lcars-pill-button`.

```html
<button onclick="playSoundAndRedirect('audio2', 'page.html')" class="lcars-button">49980</button>
```

Rows: the wrapper sets the style.

```html
<div class="buttons justify-center">        <!-- or pill-buttons -->
  <button onclick="playSoundAndRedirect('audio2', '')">788304</button>
  <button onclick="playSoundAndRedirect('audio2', '')" class="border-blue button-medium-dark-gray">0219</button>
</div>

<div class="flatside-button-wrapper">       <!-- stacks vertically -->
  <button onclick="playSoundAndRedirect('audio2', '')" class="border-blue">19658</button>
</div>
```

Row alignment: `justify-center`, `justify-flex-end`, `justify-space-evenly`, `justify-space-between`, `justify-space-around`.

Sidebar nav (goes after `.panel-3` in `.left-frame`):

```html
<div class="sidebar-nav">
  <button onclick="playSoundAndRedirect('audio2', '#')">button 01</button>
</div>
```

All sidebar panels in v26+ are already buttons. To add a new one, use `<button class="panel-button panel-0">`.

## Colors

Picard palette names: `blue`, `bright-blue`, `dark-blue`, `dark-gray`, `ghost-gray`, `light-gray`, `light-orange-red`, `medium-dark-blue`, `medium-dark-gray`, `orange-red`, `pale-orange-red`, `primary-gray`, `starlight`.

Use them with these prefixes: `button-<color>`, `border-<color>`, `font-<color>`, `bullet-<color>`.

## Image frame

```html
<div class="image-frame">
  <div class="imgf-title"><div class="h4-wrapper"><h4>Title</h4></div></div>
  <div class="imgf-image-body">
    <div class="image-holder"><img src="..." alt="..." width="800" height="auto"></div>
  </div>
  <div class="imgf-base">
    <div class="imgf-block-1"> </div><div class="imgf-block-2"> </div><div class="imgf-block-3"> </div>
    <div class="imgf-block-4"> </div><div class="imgf-block-5"> </div>
  </div>
</div>
```

Remove the `<h4>` for the version without a title. Simpler images: `pics` (centered), `pics-right` / `pics-left` (text wraps around), and `caption` for a caption.

## Text and elements

- List: `<ul class="lcars-list">`, with `bullet-<color>` on each `<li>`.
- Bars: `<hr>` or `<hr class="lcars-bar">`. Quotes: `<blockquote>`.
- Blinking text: `blink`, `blink-slow`, `blink-fast`.
- Utility classes: `flush` (removes the gap under a heading), `nomar`, `go-left`, `go-right`, `go-center`, `go-big`, `uppercase`, `strike`, `now` (no wrapping), `big-sky` (large top margin).
- `hop` / `hide-720` hide text on narrow screens.

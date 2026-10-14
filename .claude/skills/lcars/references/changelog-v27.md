# LCARS 27 Changelog 
NOTE: This is an active changelog for LCARS version 27 and will update as changes are made. The release of version 27 will be in the first half of October. 
Last Updated: October 2, 2026 @ 8:10 AM CDT (UTC -5). 

## All Templates/Themes  
Added sound file `beep5.mp3` to the assets folder. 
Added `audio5` preload to each HTML template. 
Updated `lcars.js` and renamed file to `lcars-27.js`. 
Added formatting for ordered lists `<ol>`. 
Deleted CSS rules for Firefox, `@-moz-document url-prefix()`. This browser hack was implemented because Firefox was slow to support the CSS properties `text-box-trim` & `text-box-edge` (shorthand `text-box`). 
CSS: `#topBtn` changed bottom padding value from `10vh` to `5vh` and deleted media query.*  
* Excludes Picard theme. 

## Classic Theme 
classic.css  
Changed `--code-color` from `african-violet` to `subdued-sienna`.  

## Nemesis Blue Theme 
nemesis-blue.css  
Changed Button 1 color (`--nav-1-color`) from `red-brown` to `cool`. See image below. 
Changed Button 3 color (`--nav-3-color`) from `leather` to `honey`. See image below. 
Changed Button 4 animation color change. WAS: `pumpkin` to `cool` NOW: `pumpkin` to `copper`.   

## Picard Theme 
picard.css  
Added missing `display: block` to the `img` reset. 
Changed `<hr>` margin block from `1rem` to `2.5rem`. 
Deleted the margins for `.lcars-bar` to reduce redundancy. 
Changed `.flatside-button-wrapper button, .flatside-button` right margin from `0.75rem` to `1rem`. 
Added `--sidebar: 140px;` to `:root` inside media query `@media (width <= 840px)`. 
`.space-4::before` third media query, changed `width <=` from `720px` to `840px`. 
`body{}` changed padding to one declaration: `padding: 0.5rem;`.  
`.garnish` changed top margin from `1rem` to `15px` and added a bottom margin with a value of `15px`. 
`.garnish::before` changed `top:` value from `4` to `3`. 
`.bar-1::before` changed `top:` value from `calc(-12px - var(--bar-height));` to `calc(-1px - var(--bar-height));` and modified all/most media queries. 
`.bar-1::before` media query `@media (width <= 840px)` added `top: calc(-5px - var(--bar-height));`. 
`.bar-1::after` changed `top:` value from `calc(8px - var(--bar-height));` to `calc(2px - var(--bar-height));` and modified all/most media queries. 
`.bar-1::after` media query `@media (width <= 840px)` added `top: calc(-2px - var(--bar-height));`. 
`.top-display-right` deleted bottom margin and all media queries except for `@media (width <=720px) { border-bottom-left-radius: 0.75rem; }` 
`.top-display` deleted `overflow: hidden;` & `width: 100%;`. 
Deleted artifacts from earlier development. 
`.garnish` added `margin-bottom: 10px;` to media query `(width <= 1040px)`. 
`.garnish` added `margin-top: 10px;` to media query `(width <= 840px)`. 
`main` deleted top margin.  

## New Theme 
Watch this space.

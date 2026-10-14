# html elements 
 unordered list horizontal line lcars bar blockquote blinkies text formatting change text color    

## Unordered List 
NOTE: The bullets will all be one color - the default color - unless given a special class name.  
First item in a list 
Second list item  
```

<ul class="lcars-list">
  <li>First item in a list</li>
  <li>Second list item</li>
</ul>
```

### How to Change Bullet Color  
First item in a list 
Second list item  
NOTE: The method of changing bullet color depends on the version of LCARS you are using... 

### Version 24+ 
Pick a color from the Color Guide and use the class name, but start with *bullet-*. See example code below: 
```

<ul class="lcars-list">
  <li class="bullet-true-mauve">First item in a list</li>
  <li class="bullet-butterscotch">Second list item</li>
</ul>
```

### Previous Versions 
Pick a color from the Color Guide and use the class name, but start with *oc-* (oc = oval color). See example code below: 
```

<ul class="lcars-list">
  <li class="oc-mars">First item in a list</li>
  <li class="oc-gold">Second list item</li>
</ul>
```

## Horizontal Line `<hr>`  

## LCARS Bar 
NOTE: For an LCARS bar with text, see this page.  
Note: The HTML for inserting a LCARS Bar depends on the version of LCARS you are using... 

### Version 24+ 
```

<hr class="lcars-bar">
```

### Previous Versions 
```

<div class="lcars-bar"> </div>
```

NOTE: The LCARS Bar is a single empty <div> with the class name *lcars-bar*. However, pre Version 23-B templates required an additional <div> with the class name *lcars-bar-inner* inside the lcars-bar div like this: 
```

<div class="lcars-bar">
	<div class="lcars-bar-inner"> </div>
</div>
```

## Blockquote  
"The first duty of every Starfleet officer is to the truth, whether it's scientific truth or historical truth or personal truth! It is the guiding principle on which Starfleet is based." -Captain Picard  

## Blinkies 
Add either the class *blink*, *blink-slow*, or *blink-fast* to an HTML element for a blinking effect. 

### blink `
						<h3 class="blink">Blink</h3>
					` 

### Blink Slow `
						<h3 class="blink-slow">Blink Slow</h3>
					` 

### Blink Fast `
						<h3 class="blink-fast">Blink Fast</h3>
					` 
Now let's change the color (Version 24+): 

### Alert `
						<h3 class="blink-fast font-mars">ALERT</h3>
					` 
NOTE: The custom color/class name "mars" is taken from the LCARS Color Guide. 
You can apply the "blink" class to any text element, such as paragraphs <p>, headings <h1>,<h2> etc., or <span>. 

## Text Formatting • Custom Class Selectors 
`flush`
 Basically this removes space between a header element and a paragraph. Specifically, this sets the top margin of an element to a negative value so that the line is flush against the previous element. 
`nomar`
 Resets an element's margins to 0. 
`go-right`
 Aligns text to the right. 
Look at me, I'm way over here to the right of the page! 
`go-left`
 Text aligns to the left by default, with some exceptions. For instance, the main page heading (`<h1>`) aligns right. But maybe you want it to align left instead. So rather than going in to CSS and making changes there, you can just add this class to the `<h1>` tag. 
`go-center`
 Centers text in an element. 
Look at me, I'm centered! 
`go-big`
 Makes text in an element a little bigger than normal 
`uppercase`
 Transforms text to all uppercase letters 
`strike`
 Strikethrough: I love Mondays 
`now`
 This gives the whitespace property a value of nowrap. I use this when I don't want a string of words to break at the end of a line. This can happen when the veiwport shrinks. Take Star Trek, for example, which are two words that look better next to each other. If you're like me, you wouldn't like Star to be at the end of one line and Trek at the start of the next line.

 I grew up watching Star
 Trek.  Here is the fix:
 `<span class="now">Star Trek</span>`

 I grew up watching Star Trek.  
`big-sky`
 This almost quadruples the top margin of an element. Use case: this page - I use this on the `<h2>` heading tags to add more space between topics. 

## change text color 
Note: The method of changing text color depends on the version of LCARS you are using... 

### Version 24+ 
Change text color simply by adding the class `font-color-name` and replacing *color-name* with the actual color name from the LCARS Color Guide. 
`
						<p class="font-almond-creme">The line must be drawn here.</p>
					`
 The line must be drawn here. 

### Pre-Version 24 
Instead of `font-color-name`, replace `font-` with `go-`: 
`
						<p class="go-almond-creme">The line must be drawn here.</p>
					` 

## HTML Image Elements 
Please see USING IMAGES page. 

## LCARS Buttons 
Please see BUTTONS page. 
page last updated 2026, July 29.

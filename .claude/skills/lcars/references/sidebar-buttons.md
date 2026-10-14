# Sidebar Buttons 
Note: These instructions apply to LCARS Version 24.2 and above. HTML For older versions follows below.  
Insert the HTML below AFTER: `<div class="panel-3">03<span class="hop">-111968</span></div>` 
NOTE: For instructions on how to convert a sidebar panel into a clickable 'panel button' please see this page. 
```

<div class="sidebar-nav">
	<button onclick="playSoundAndRedirect('audio2', '#')">button 01</button>
	<button onclick="playSoundAndRedirect('audio2', '#')">button 02</button>
</div>
```

Replace `#` with an actual URL. 
You can insert just one button or as many buttons as you like. 
Regarding `audio2`: there are 4 audio options - audio1, audio2, audio3, and audio4.  

### Change Button Color 
To change the button color, simply add the class `button-color-name` to the `<button>` element but replacing *color-name* with the color name from the Color Guide. This method works on all buttons. 
```

<div class="sidebar-nav">
	<button onclick="playSoundAndRedirect('audio2', '#')" class="button-subdued-sienna">875501</button>
</div>
```

 875501  

## Pre Version 24.2 
Use the following HTML for LCARS versions before 24.2 
```

<div class="sidebar-buttons">
	<a href="#">button 01</a>
	<a href="#">button 02</a>
</div>
```

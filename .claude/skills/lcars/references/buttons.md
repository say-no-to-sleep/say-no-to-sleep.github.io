# LCARS Buttons 
ALERT: For Picard Theme buttons please go here. 
The following instructions are for LCARS versions 24.2 and above. If you are looking for how to add buttons to the sidebar, please see this page. For sidebar 'panel buttons' please see this page. 
 single button row of buttons change button color button layouts blinking button    

## Single Button example 
```

<button onclick="playSoundAndRedirect('audio2', '')" class="lcars-button">example</button>
```
 NOTE: After `'audio2',` insert a URL between the `''` to link to another page or site.   
NOTE: There are 4 audio files of LCARS keystrokes available for you to choose - beep1.mp3, beep2.mp3, beep3.mp3 and beep4.mp3. In the code above, `'audio2',` links to beep2.mp3, 'audio1' would be for beep1.mp3 and so-on. 

## Row of Buttons 
Only 2 buttons are shown in this example, but you can add as many buttons as you like. Buttons will wrap as the device window shrinks. 
 button 01 button 02  
```

<div class="buttons">
	<button onclick="playSoundAndRedirect('audio2', '')">button 01</button>
	<button onclick="playSoundAndRedirect('audio2', '')">button 02</button>
</div>
```
 NOTE: After `'audio2',` insert a URL between the `''` to link to another page or site.   
NOTE: Every button in the parent div with the class name `buttons` will automatically be styled as an LCARS button without the need of assigning a class to each button. Whereas a single button requires the class name of `lcars-button`. 

## Change Button Color 
You can change a button's color simply by adding the class name `button-color-name` and replacing *color-name* with the actual color name from the LCARS Color Guide. dusty-mauve 
```

<button onclick="playSoundAndRedirect('audio2', '')" class="lcars-button button-dusty-mauve">dusty-mauve</button>
```

NOTE: For previous versions (before Version 24) simply drop the *button-* before the color name. 

## Button Layouts 
NOTE: The following method is for LCARS version 24.2 and above. For previous versions of LCARS, replace `'justify-'` with `'jc-'`. Buttons align to the left by default. 
Use the following class selectors (shown in orange) in the parent *buttons* DIV (`<div class="buttons justify-(option)">`) to position a button or group of buttons. Note that buttons will wrap at smaller viewport sizes. Positioning classes work in all themes. 

### center one or more buttons 
`justify-center` 
 BA-001 BB-002  
```

<div class="buttons justify-center">
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-barley">ba-001</button>
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-bluey">ba-002</button>
</div>
```

### Buttons that Align to the Right 
`justify-flex-end` 
 BA-001 BB-002  

### a group of buttons that are spaced evenly 
`justify-space-evenly` 
Buttons are distributed so that the spacing between any two adjacent alignment buttons, before the first alignment button, and after the last alignment button is the same. 
 BA-001 BB-002 Bc-003  

### a group of buttons that fill a line 
`justify-space-between` 
Buttons are evenly distributed in the line; first button is on the start of the line, last button on the end of the line. 
 BA-001 BB-002 Bc-003  

### a group of equally spaced buttons 
`justify-space-around` 
Buttons are evenly distributed in the line with equal space around them. 
 BA-001 BB-002 Bc-003  

## Blinking Button 
```
<button onclick="playSoundAndRedirect('audio2', '')" class="lcars-button blink"></button>
```
 78412 
NOTE: For usability, the blinking stops on mouseover. 
page last updated July 29, 2026

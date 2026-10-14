## Types of Button Styles 

### Standard Button 704998 `class="lcars-button"`  

### Flatside Button 55419 `class="flatside-button"`  

### Pill Button 3972 `class="lcars-pill-button"`  

## Instructions & HTML 

### Single Button 
NOTE: You can Change the button style (to Flatside or Pill) by changing the button's class name. Class names are shown above. 49980 
```
<button onclick="playSoundAndRedirect('audio2', '')" class="lcars-button">49980</button>
```

NOTE: AFTER `'audio2',` insert a url between the `''` to link to another page or site.    

### A Row of 2 or More Standard Buttons 
NOTE: This method is for Standard buttons only. Instructions for Pill and Flatside buttons follow further on down.
 NOTE: Each button does not require a class name as the button style is determined by the parent DIV. 
 788304 0219 677814  
```
<div class="buttons">
	<button onclick="playSoundAndRedirect('audio2', '')">788304</button>
	<button onclick="playSoundAndRedirect('audio2', '')">0219</button>
	<button onclick="playSoundAndRedirect('audio2', '')">677814</button>
</div>
```

NOTE: AFTER `'audio2',` insert a url between the `''` to link to another page or site.   

#### Change Single Button Border Color 
INSERT THE CLASS `border-color-name` AND REPLACE `color-name` WITH THE ACTUAL COLOR CLASS NAME  (THERE IS A COLOR GUIDE AT THE END OF THIS PAGE). IN THIS SINGLE BUTTON EXAMPLE, THE BUTTON ALREADY HAS A CLASS NAME OF `lcars-button` BUT YOU CAN USE MORE THAN ONE CLASS NAME AT A TIME. 40469 
```
<button onclick="playSoundAndRedirect('audio2', '')" class="lcars-button border-blue">40469</button>
```

NOTE: AFTER `'audio2',` insert a url between the `''` to link to another page or site.   

#### Change Button Color And Border Color in a Row of Buttons 
Here is an example of how to change the side border color, and the button color, in a row of buttons: 
 788304 0219 677814  
```
<div class="buttons">
	<button onclick="playSoundAndRedirect('audio2', '')">788304</button>
	<button onclick="playSoundAndRedirect('audio2', '')" class="border-blue button-medium-dark-gray">0219</button>
	<button onclick="playSoundAndRedirect('audio2', '')">677814</button>
</div>
```

NOTE: AFTER `'audio2',` insert a url between the `''` to link to another page or site.    

### A Row of 2 or More Pill Buttons 
This example shows how to change a button's color. The first button is the default button color. 
 99844 200417 527302 2145  
```
<div class="pill-buttons">
	<button onclick="playSoundAndRedirect('audio2', '')">99844</button>
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-light-orange-red">200417</button>
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-medium-dark-gray">527302</button>
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-medium-dark-blue">2145</button>
</div>
```

NOTE: AFTER `'audio2',` insert a url between the `''` to link to another page or site.    

### A Column of 2 or More Flatside Buttons 
Flatside buttons are intended to stack vertically. This example includes the method for changing the color of the side border (first button), and the button color (third button). 
 19658 0819 730469  
```
<div class="flatside-button-wrapper">
	<button onclick="playSoundAndRedirect('audio2', '')" class="border-blue">19658</button>
	<button onclick="playSoundAndRedirect('audio2', '')">0819</button>
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-medium-dark-gray">730469</button>
</div>
```

NOTE: AFTER `'audio2',` insert a url between the `''` to link to another page or site.    

### Layout Options 
These methods work for both Standard and Pill buttons. Flatside buttons, however, stack vertically and are not applicable to these instructions. 

#### Center One or More Buttons 
`justify-center` 
 BA-001 BB-002  
```

<div class="buttons justify-center">
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-barley">ba-001</button>
	<button onclick="playSoundAndRedirect('audio2', '')" class="button-bluey">ba-002</button>
</div>
```

#### Buttons That Align to the Right 
`justify-flex-end` 
 BA-001 BB-002  

#### A Group of Buttons That Are Spaced Evenly 
`justify-space-evenly` 
Buttons are distributed so that the spacing between any two adjacent alignment buttons, before the first alignment button, and after the last alignment button is the same. 
 BA-001 BB-002 Bc-003  

#### A Group of Buttons That Fill a Line 
`justify-space-between` 
Buttons are evenly distributed in the line; first button is on the start of the line, last button on the end of the line. 
 BA-001 BB-002 Bc-003  

#### A Group of Equally Spaced Buttons 
`justify-space-around` 
Buttons are evenly distributed in the line with equal space around them. 
 BA-001 BB-002 Bc-003   

## Color Guide & Class Names  
blue 
bright-blue 
dark-blue 
dark-gray 
ghost-gray 
light-gray 
light-orange-red 
medium-dark-blue 
medium-dark-gray 
orange-red 
pale-orange-red 
primary-gray 
starlight

# Panel Buttons 
NOTE: All sidebar panels in the latest release of LCARS - V26 - are HOT. This means that they are already clickable/linkable buttons. Even the corners! The following instructions are for V24.2 only. Also note that V24.2 was the immediate predecessor to V26. 

## Transform a specific sidebar panel into a clickable 'panel button' 
In this example we are converting panel 4 into a clickable button that links to another page.  
Find the div with class name `panel-4` and either comment it out (as shown below) or delete it. Then replace it with the `button` element as shown. (Actual code that can be copied follows the graphic.) PLEASE NOTE: Panel 3 is excluded from this conversion option. Only panels 4 and above can be converted to buttons.  
* This class replicates a specific panel, in this case panel number 4. 
** By default, text in a panel button aligns at the top. Use this class if you wish to align text at the bottom of the panel. Since panel 4 text is originally aligned at the bottom, this class was used. 

## Panel Button HTML Code  
Replace `#` with actual URL. 
Replace `x` in `pan-x` with specific panel number (e.g. `pan-5` for panel 5). 
Regarding `audio2`: there are 4 audio options - audio1, audio2, audio3, and audio4. 
The button color will be the same as the panel it is replacing. However, you can opt to change the button color. For instructions on how to change the color of a button see this page.  
```

<button onclick="playSoundAndRedirect('audio2', '#')" class="panel-button pan-x">text</button>
```

## Create a New Panel Button 
If you want to insert a panel button without converting an existing panel, simply insert the above HTML after/before an existing panel and use the class `panel-0`.

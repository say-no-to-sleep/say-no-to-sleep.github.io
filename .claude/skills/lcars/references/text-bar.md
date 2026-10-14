# LCARS Text Bar 

#### hello world  
```

<div class="lcars-text-bar">
	<h2>hello world</h2>
</div>
```

NOTE: You can use h2, h3 and h4 heading tags. If you don't want to use a heading tag, you can use the span tag instead: `<span>hello world</span>`. 

## Display Text at End of Bar 
 hello world  
Simply add the class `the-end`... 
```

<div class="lcars-text-bar the-end">
	<span>hello world</span>
</div>
```

## Change Text Color 
Note: The method of changing text color depends on the version of LCARS you are using... 
 hello world  

### Version 24+ 
As you can do with any text in the template, pick a color from the Color Guide and use the class name, but start with `font-`. 
```

<div class="lcars-text-bar">
	<span class="font-lilac">hello world</span>
</div>
```

### Pre-Version 24 
Pick a color from the Color Guide and use the class name, but start with `go-`. 
```

<div class="lcars-text-bar">
	<span class="go-lilac">hello world</span>
</div>
```

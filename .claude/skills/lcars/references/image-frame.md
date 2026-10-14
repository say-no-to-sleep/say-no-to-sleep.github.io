# LCARS Image Frame 
This user request made its way silently into a previous version of LCARS. It has been reworked and perfected for LCARS version 26. Here it is in action with HTML following: 

#### U.S.S. Enterprise   

## HTML Please replace the example image URL with your own. 
```

<div class="image-frame">
	<div class="imgf-title">
		<div class="h4-wrapper">
			<h4>Title</h4>
		</div>
	</div>
	<div class="imgf-image-body">
		<div class="image-holder">
			<img src="https://d700mbxo45lbr.cloudfront.net/lcars/odn/1701e.jpg" width="800" height="auto">
		</div>
	</div>
	<div class="imgf-base">
		<div class="imgf-block-1"> </div>
		<div class="imgf-block-2"> </div>
		<div class="imgf-block-3"> </div>
		<div class="imgf-block-4"> </div>
		<div class="imgf-block-5"> </div>
	</div>
</div>
```

## No Title Option 
Remove the `<h4></h4>` element and you get the following result:

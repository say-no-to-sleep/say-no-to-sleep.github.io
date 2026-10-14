# LCARS Fonts 
When asked on Twitter what font was used for LCARS, Michael Okuda responded: "I mostly used Helvetica Ultra Compressed. I also used Letraset Compacta, and a couple of others when I had to." @MikeOkuda 
Unfortunately, I was unable to use the traditional LCARS fonts for this template. This is mainly because not everyone has the above fonts installed on their computer. As a solution, I chose to use Google Fonts. I searched until I found a font that would pass for the LCARS style. The first font I found was 'Oswald', which I used through LCARS Version 7. In May of 2021, I discovered 'Antonio' which even more closely matched the LCARS style font and it is what I am still using today. 
In the head section of the HTML template page of earlier template files, you would have found this: `		
						<link rel="preconnect" href="https://fonts.googleapis.com">

						<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

						<link href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;700&display=swap" rel="stylesheet">
					` 

## LCARS Now Handles Fonts Differently 
With the more recent versions of LCARS, I opted to self-host the LCARS font (Antonio) rather than use Google. I made this change because a German court ruled that using Google's font library violates EU's General Data Protection Regulation. So Antonio is baked into the current version of LCARS with no reliance on Google's servers, and bypasses any legal conundrums with the European Union.

---
title: Running the Game Without the Game
project: _projects/polytrack-ai.md
unlisted: false
---
Well well well, look where we are now.

Last time I said stage 1 is "take the champion's inputs and brute force something slightly better". 

This means brute force here, and that implies trying thousands and thousands of input variations. Technically I can try doing that in a browser tab at 1x speed but I would rather prefer it finish calculating before the heat death of the universe

> Tangent: Apparently new discoveries in Dark Energy/Matter mean that we might not be headed for heat death after all... But we shall see.

Yep, this means that we have to find a way to run this game without the game, using a simulator.

## No reimplementation

Tempting thing would be to rewrite the physics, which is 1: probably a huge pain in the ass, and 2: probably not gonna feature match at some random obscure point and will cause the entire thing to collapse. 

So we would rather not want to do that...

Polytrack it turns out, runs its sims in a web worker. It's just a js file with a physics engine. We can lie to this thing about being a browser with Node and it will happily accept whatever you want it to do. 

The game even has a verify handler that simulates an entire recording in 1 loop which is what the leaderboard uses to check runs btw. 

Once the game is saved, the page sends to this worker two (2) messages: 

- Geometry of all 186 track part types (as of October 2026, may be more in the future) and the car's collision hull. 
- one `CreateCar` message per map, with the track data and the surrounding mountains

## Well then does it match 

Giving it the champion's run on Desert 1 and it did finish exactly at frame 25245 which is exactly the leaderboard time.

It does this entire loop in about 190ms which if you calculate against the actual playtime, is 130~160x real time... Bonkers. And on a single core as well. 

If I accidentally forgot to disclose why I chose Desert 1, it's because of the ramp at the start. Please feel free to go check the ramp.

So now what, we got a simulator and we got data. Let’s try nudging things a bit. I’m sure nothing will go wrong.

![image.jpeg](/assets/image.jpeg)

Pictured: middle aged man trying to be helpful by suggesting to nudge some things.

## Walking on the Razer

Let’s do something… let’s see

Ah yes, let’s press the right (->) (➡️) key for 1 millisecond. What’s the worse that can happen??

As it turns out it depends on the timing

- Before about 9.5 s, or the very last toggle: nothing changes. Still 25245.
- Almost anywhere after 9.6 s: the car no longer finishes.

Which seems absurd until you realize just with how much precision they have to play polytrack.

So there goes the easy solution of just trying 1 input to try to make it faster and rinse and repeat. EVERY change has to be followed by re-searching the entire input space afterwards.

If only we had a thing there we can use to segment this map up and try individual parts to search… I guess we’ll never know.

Wait now hold on a second… segmentation… resume from here… I think you know where we’re going. 

## Save states

As mentioned earlier the car’s physical state lives in the wasm memory in one block. What we want is a checkpoint which yoinks this block then copies it. A restore would write this block back. 

To make sure it actually works I saved checkpoints at frames 0, 5000, 9600, 15000, 25000 and restoring the checkpoint after going through them restored exactly the car state. Horrah! 

The payoff as briefly explored above is definitely the fact that restoring and finishing a checkpoint is way less time consuming than replaying the track up to that point:

- restore at 15s and finishing takes 61ms instead or 190. Massive time improvement
- the later this checkpoint is, the benefit increases as well. 

And since we’re doing segmented search, this is the best news we want to hear today.

## Where this leaves us

Next up, mapping which keys I can touch without sending the run to the gutters. As well as the actual search.
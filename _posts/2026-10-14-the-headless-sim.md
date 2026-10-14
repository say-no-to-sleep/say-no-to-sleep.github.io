---
title: Running the Game Without the Game
project: _projects/polytrack-ai.md
---
Last time I said stage one is "take the champion's inputs and brute force something slightly better". Brute force means trying thousands upon thousands of input variations. Trying them in a browser tab at 1x speed means the champion keeps the seat until the heat death of the universe. So first, I need a simulator that is fast, and *exactly* the game.

## No reimplementation

The tempting thing is to rewrite the physics myself. That is also how you get a simulator that is 99% right, which in a game decided by milliseconds is 100% wrong.

So I didn't. PolyTrack runs its simulation in a web worker: a normal JS file plus a wasm physics engine (C++ under the hood). Node can run that if you lie to it about being a browser. It needs a fake `self`, `importScripts`, `postMessage`, and a `fetch` that reads files. That is about it. The game even ships a `Verify` handler that simulates a whole recording in one tight loop, which is what the leaderboard uses to check runs.

Two messages the page normally sends the worker get captured once from the real game and saved:

- the geometry of all 186 track part types plus the car's collision hull (13 MB, same for every track)
- one `CreateCar` message per map, with the track data and the surrounding mountains

## Does it match?

Feed it the champion's run on Desert 1 and it finishes on **frame 25245**, exactly the leaderboard time. Twenty repeat runs, identical every time.

It does this in about 190 ms. That is roughly **130 to 160 times real time**, on one core, in a laptop, without a GPU.

## Save states, like an emulator

The part I'm happiest about. All of the car's physics state lives in the wasm memory, in one block. So a checkpoint is a copy of that block (24 MB, about 5 ms), and a restore writes it back (about 3 ms).

To make sure it really works, I saved checkpoints at frames 0, 5000, 9600, 15000 and 25000. After each one I drove 3000 frames of garbage input to wreck the car, restored the checkpoint, and replayed the champion's inputs. Every frame's full 227-byte car state matched the original run.

(There was a moment where it *didn't* match. That was me comparing two different cars, and byte 0 of the state is the car's id. Hours of my life.)

The payoff: restoring at 15 s and finishing takes about 61 ms instead of 190. The later the checkpoint, the more you save, and the end of the run is where I'll be searching the most.

## The bad news: a knife edge

Then I tried the obvious experiment. Take one `right` key press and shift it by **1 millisecond**.

- Before about 9.5 s, or the very last toggle: nothing changes. Still 25245.
- Almost anywhere after 9.6 s: the car no longer finishes.
- 5 of 110 variants still finished. All of them slower. None faster.

So the champion's run is not a smooth hill I can climb one nudge at a time. It is a tightrope. Change one toggle and everything after it is now a different run.

This kills the naive plan ("nudge a toggle, keep it if faster, repeat"). Every change has to be followed by re-searching all the inputs after it. Which is where the checkpoints come in: work back to front, segment by segment, and never replay the part of the run I'm not touching.

## Where this leaves us

Next up is mapping which of the four keys' toggles can move at all without breaking the run, and recording split times at the checkpoints. After that, the actual search.

Limits worth admitting: each checkpoint is 24 MB (a checkpoint every second of a run would be about 600 MB), it can only drive one car at a time since a restore rewinds every car, and I've only tested Desert 1. Capturing a new map is still a manual job of hooking `Worker.prototype.postMessage` before the game loads. Future me's problem.

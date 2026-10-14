---
title: 4-Bit Binary Adder/Subtractor
dates: June 2024
details: Logisim, Tinkercad, NPN transistors
summary: A 4-bit arithmetic unit built from discrete NPN transistors, passive components, six breadboards, and a lot of wiring.
---

This is a hardware-focused capstone with [Andrew Yong](https://www.linkedin.com/in/heng-yong-215927362/): A 4-bit arithmetic unit built from discrete NPN transistors and other components.

## Project Overview

The goal was to build a functional arithmetic unit capable of handling 4-bit inputs (0 to 15) and producing a 5-bit output (0 to 31), demonstrating our digital logic at the transistor level without using arithmetic ICs or a microcontroller. It was our final project for TER4M (Computer Engineering), and the only one in two years with no software at all.

<video controls preload="metadata" playsinline>
  <source src="/assets/projects/adder-subtractor/adder-subtractor-demo-web.mp4" type="video/mp4">
  <a href="/assets/projects/adder-subtractor/adder-subtractor-demo-web.mp4">View the adder/subtractor demo video</a>
</video>

Demo of the finished circuit on the breadboards.
{: .caption}

## Design Process

1. Designed and tested the full-adder logic in a logic simulator using XOR, AND, and OR gates.
2. Cascaded four full adders, feeding each carry-out into the next carry-in.
3. Added XOR gates on the second input, driven by a mode switch that also feeds the first carry-in, for two's-complement subtraction.
4. Translated the gates into transistor circuits, based on the 4-bit calculator and XOR gate schematics from Global Science Network.
5. I rebuilt the transistor circuit in Tinkercad as a tested reference. Its wiring was too messy to cut and strip by hand, so Andrew redesigned the layout to be readable, and I replicated his version in Tinkercad.

![Full-adder logic diagram with A, B, and carry-in switches driving sum and carry-out](/assets/projects/adder-subtractor/full-adder-logic.png "Full adder"){: .medium}

One full adder: two XOR gates for the sum, two AND gates and an OR gate for the carry.
{: .caption}

## The Subtraction Bug

Addition worked first try in simulation: 0101 + 0011 gave 01000 (5 + 3 = 8). Subtraction did not. 1010 − 0111 should give 00011 (10 − 7 = 3), but the simulator showed 10011.

![Simulated 1010 minus 0111 lighting the carry LED by mistake](/assets/projects/adder-subtractor/subtraction-bug.png "Before the fix"){: .large}

In two's-complement subtraction, the final carry-out is always 1 for a valid result, so the fifth LED stayed lit. We fixed it by adding a NOT gate on the subtraction switch and an AND gate on the last carry-out, so the fifth LED only lights in addition mode. After the fix, 1001 − 0011 gave 00110 (9 − 3 = 6).

![Simulated circuit with the NOT and AND gates masking the carry LED in subtraction mode](/assets/projects/adder-subtractor/subtraction-fix.png "After the fix"){: .large}

## Physical Build

![Tinkercad breadboard layout of the full adder-subtractor with a 9V battery, DIP switches, and four adder boards](/assets/projects/adder-subtractor/tinkercad-layout.png "Tinkercad reference"){: .large}

The Tinkercad layout we built from: the switch and XOR boards on the left, one full adder per board on the right.
{: .caption}

We worked as an assembly line. I placed the transistors and resistors while Andrew measured and cut the wires; then I stripped wires while Andrew placed them on the boards.

| Component | Quantity |
| --- | --- |
| NPN transistors | 104 |
| 1 kΩ resistors | 45 |
| 2 kΩ resistors | 20 |
| 470 Ω resistors | 8 |
| Switches | 9 |
| Green LEDs | 5 |
| Breadboards | 6 |
| Jumper wires | 212 (124 adder, 32 XOR, 14 data, 42 power) |

The full transistor-level schematic is in the [schematic PDF](/assets/projects/adder-subtractor/adder-subtractor-schematic.pdf) (7 sheets, exported from Tinkercad).

![Breadboarded 4-bit adder-subtractor circuit with switches and LEDs](/assets/projects/adder-subtractor/IMG_4433.jpg){: .medium}

The completed breadboard setup with the input switches, output LEDs, and cascaded transistor logic spread across the build.
{: .caption}

![Close-up of jumper wiring and transistor logic on the adder-subtractor breadboards](/assets/projects/adder-subtractor/IMG_4437.jpg){: .medium}

Close-up of the dense wiring that made physical debugging the main challenge after the simulated logic was working.
{: .caption}

## Debugging

With over 200 wires, checking by eye wasn't enough. We assembled and tested one full-adder board first and used it as the template for the other three. After building those, we photographed each new board and overlaid it on the template in Photoshop to spot differences.

Two errors still slipped through:

- The two wires connecting a pair of transistors in the adder didn't match the Tinkercad design, and we only noticed while working out why it wasn't working.
- One input to an AND gate in the adder was wired wrong. This took an embarrassing amount of time to find: I took the project home and recreated every wire in Tinkercad until the mismatch showed up.

Even with the wiring verified, the circuit only worked some of the time. With so many connection points, loose contacts between the wires, components, and breadboards were enough to break it. The design worked every time in simulation; the physical build did not.

## Proposal vs. Result

The original proposal had a Raspberry Pi convert decimal input to binary and show the binary output as a decimal number on an LCD. Debugging took far longer than planned, and with the breadboard this unreliable, we left the Raspberry Pi out. Soldering the components or otherwise making the connections more rigid would have made the build much more dependable.

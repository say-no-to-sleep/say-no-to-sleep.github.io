---
title: Astrodyn
dates: Aug 2026 – Sep 2026
details: Python, NumPy, pytest, SPICE
summary: A dependency-light Python astrodynamics library built from scratch, with a two-body propagator, a safeguarded Lambert solver, and an Earth-to-Mars porkchop plot.
order: 1
---
A small Python orbital mechanics library built from scratch on NumPy, following Curtis's *Orbital Mechanics for Engineering Students* chapter by chapter. It propagates orbits, converts between state vectors and orbital elements, and solves Lambert's problem, and it powers an Earth-to-Mars launch window plot driven by real JPL ephemerides. The code is on [GitHub](https://github.com/say-no-to-sleep/astrodyn).

## From App to Library

It started as an "astrodynamics trajectory designer", an application. After working through the first four chapters of Curtis, I reframed it as a library with one rule: every function is a pure function of its inputs, with no idea who is calling it. No hardcoded planets, no assumed coordinate system, no plotting inside the library. You pass in the gravitational parameter μ and a state, and you get results back.

That makes the same code work for Earth, Mars, the Sun, or a fictional planet in a game like Kerbal Space Program. Demos such as the porkchop plot sit on top as separate scripts, and NumPy is the core library's only dependency.

## What's in It

- **Stumpff functions:** the C(z) and S(z) functions that the propagator and Lambert solver both build on, vectorized, with a Taylor series near zero.
- **Orbital elements:** conversion between position/velocity vectors and the six classical elements, including the circular and equatorial cases where the usual angles are undefined.
- **Frames:** rotation between the orbit's own (perifocal) frame and the Earth-centered inertial frame.
- **Propagator:** Curtis's universal-variable method, which handles elliptical, parabolic, and hyperbolic orbits in one code path. Every call checks the Lagrange identity (f·ġ − ḟ·g = 1) as a cheap sanity test.
- **Lambert solver:** given two positions and a flight time, find the orbit that connects them.

## Making the Lambert Solver Robust

The first porkchop plots had noisy, broken patches. For long transfers, Newton's method would step into a region where an intermediate quantity went negative, and the NaN that followed spread silently through the plot.

The fix was a safeguarded solver. It first finds a bracket that must contain the answer: searching upward toward the single-revolution limit (z = 4π²) for elliptical transfers, and outward with doubling steps for hyperbolic ones, halving the step whenever a trial lands somewhere invalid. Then it takes Newton steps, but only accepts one if it lands well inside the bracket; otherwise it bisects:

```python
z_next = (z_low + z_high) / 2

if np.isfinite(dF) and dF != 0:
    candidate = z - F/dF
    margin = 0.1 * (z_high - z_low)
    if np.isfinite(candidate) and z_low + margin < candidate < z_high - margin:
        z_next = candidate
```

Newton's speed when it behaves, bisection's guarantee when it doesn't. The plot came out clean after this.

## Testing

The tests check the code against Curtis's worked examples 3.7, 4.3, and 5.2. Textbook answers are rounded, though, so the stronger tests check the code against itself: propagate an orbit forward, hand both positions to the Lambert solver, and recover the original velocity to 1e-10. Other tests cover energy conservation, returning to the start after one full period, hyperbolic and near-parabolic transfers, and rejecting invalid values.

## Porkchop Plot

![Earth to Mars porkchop plot of total delta-v by departure and arrival date](/assets/projects/astrodyn/porkchop.png "Earth to Mars"){: .large}

Total delta-v from low Earth orbit to low Mars orbit for each pair of departure and arrival dates.
{: .caption}

The demo targets the 2028 Mars window around the planned SR-1 Freedom mission. It pulls Earth and Mars positions from JPL's DE442 ephemeris through SPICE, solves Lambert's problem in the Sun's gravity for every pair of dates on a one-day grid, and converts the result into the delta-v needed to leave low Earth orbit and capture into low Mars orbit.

The minimum comes out around 4.5 to 5 km/s, in line with published values for a good year. The thin white line through the middle is real physics, not a bug: when Earth and Mars are exactly opposite each other across the Sun, the transfer plane is undefined and the required speed spikes.

## Bugs Along the Way

- **Every orbit was a parabola.** Eccentricity came out as about 1 for everything, because μ was in m³/s² while the textbook states were in km and km/s. The whole library now uses km, km/s, and seconds.
- **Round trips didn't round-trip.** The three frame rotations were multiplied in the wrong order.
- **Random NaNs from `arccos`.** Floating-point error pushed values just past ±1, so every `arccos` input is now clipped.

## Status

Paused in September 2026 at a good stopping point. The two-body propagator, orbital elements, Lambert solver, and porkchop plot are done. Next on the roadmap: the circular restricted three-body problem, Lagrange points and halo orbits, J2 perturbations, and a port to C.

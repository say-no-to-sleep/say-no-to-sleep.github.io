---
title: Initiator Drone
dates: Jun 2026 – Sep 2026
details: Python, OpenCV, Swift, ARKit, Metal, ROS 2
summary: A thermal, depth, and gyro sensor module for indoor reconnaissance that tracks itself in 3D and shows people's body heat to an operator in AR on an iPhone.
order: 2
---
A sensor module meant to ride on a small indoor drone and scout a room before people go in. It carries an RGB-D camera, a thermal camera, and a gyro on a Raspberry Pi; it tracks its own position, builds a 3D map, and shows an operator where people's body heat is, overlaid in AR on an iPhone, even when the operator is behind a wall. The idea came from the "reveal" abilities in games like Valorant.

This is a working handheld prototype. It hasn't been mounted on a drone or flown.

## Team

A team project with [Andrew Yong](https://www.linkedin.com/in/heng-yong-215927362/) and [Ashley Zhu](https://www.linkedin.com/in/anqi-ashley-zhu-8904aa364/). Andrew and Ashley built the first version from June to August: a ROS 2 sensor stack, drivers for each sensor, a web dashboard, inertial and optical-flow odometry, and an iOS viewer with AprilTag localization.

In September I took over and rebuilt most of it: the tracking, the 3D map and web portal, and a new native iPhone app with phone-side reconstruction and thermal AR. Andrew's driver for the MI0802 thermal camera is the main piece of the earlier stack still in use. Code: [backend](https://github.com/Andrew-Heng-Yong/ros2-initiator-drone) and [iPhone app](https://github.com/Andrew-Heng-Yong/frontend-initiator-drone).

![System diagram: sensors to Raspberry Pi, then either Pi-side mapping to the web portal, or a Wi-Fi stream to the iPhone for thermal AR](/assets/projects/initiator-drone/system-diagram.png "System overview"){: .large}

The Pi captures and pairs the sensor data, then either tracks and maps on its own or streams to the phone, which does the reconstruction and AR.
{: .caption}

## Dropping the Accelerometer

The first version leaned on an MPU6050 accelerometer and gyro plus a downward optical-flow sensor. When I tested it by hand (flat, upside down, on each side, five times each), the original MPU6050's X axis read its maximum value in 100 out of 100 samples. The replacement talked fine but still responded wrongly to gravity in some orientations.

So I cut the scope: camera (depth, RGB, and thermal) for position, and only the gyro, for rotation.

## Tracking With Depth

The new tracker uses the Orbbec Gemini E's registered depth and classical geometry, no trained models:

1. Find ORB features in the RGB image, match them against a keyframe, and filter the matches.
2. Look up each feature's depth and turn it into a 3D point using the camera's calibration.
3. Solve for the camera's motion. I implemented two solvers, aligning 3D points directly (Kabsch/SVD) and PnP RANSAC, and made PnP the default after comparing them on this camera.
4. Reject any pose that fails a set of checks: too few or poorly spread matches, points that don't line up with the current depth image, or a jump faster than the module could physically move.

Accepted poses add colored points to a voxel map (4 cm voxels, capped at 60,000 points), shown live in a web portal built with Three.js.

![3D point cloud of a room in the web portal with the camera's trajectory and position](/assets/projects/initiator-drone/portal-point-cloud.jpg "Web portal"){: .medium}

The map and camera trajectory in the web portal.
{: .caption}

Stationary tests looked fine; moving the module around exposed the real problems, and the first motion recording produced a messy map. Some of the poses it accepted were simply wrong: with stricter checks, only 30 of its 86 frames passed instead of 62. Capture was a problem too. The camera's RGB and depth streams aren't synchronized, frames queued up behind slow processing, and the Pi stalled writing compressed recordings. I paired frames by timestamp and kept only the newest pair, moved slow work out of the sensor callbacks, cut the mapping loop from 322 ms to 86 ms, and wrote recordings uncompressed (112 ms down to 15 ms per write). A later 300-frame motion recording tracked 299 frames.

## Gyro Assistance

Left to itself, the gyro drifted about 9.5° over 65 seconds, so it never runs free. It only fills in the rotation for short gaps, at most one second, starting from the last pose the camera accepted. I fitted its mounting, scale, and timing against rotations measured by the camera; the fitted scale was 1.013, and it disagreed with the camera by 0.37° on 149 rotations held out of the fit.

I've since added support for a Yahboom USB gyro as a replacement, which still needs calibrating.

## Thermal AR on the Phone

The Pi is slow, and the operator already holds a capable device, so I moved the spatial work to the iPhone. The Pi streams each frame over Wi-Fi as a binary packet: a JPEG for RGB, then compressed depth and thermal arrays that keep full precision, with temperatures still in °C. The phone then:

- runs the same tracking (ported to C++ OpenCV) to follow the rig,
- tracks itself with ARKit and the iPhone's LiDAR,
- lines the two up by matching what both cameras see at startup,
- and draws the rig's heat readings into its own AR view with Metal.

![Standing person in RGB](/assets/projects/initiator-drone/standing-rgb.jpg "RGB"){: .small}
![The same scene in registered depth](/assets/projects/initiator-drone/standing-registration.jpg "Depth"){: .small}
![The same scene from the thermal camera](/assets/projects/initiator-drone/standing-thermal.jpg "Thermal"){: .small}

What the rig sees: RGB, registered depth, and thermal of Andrew standing in a kitchen.
{: .caption}

Mapping thermal pixels onto the depth camera took calibration. I captured a stationary person in all three cameras and used his face and hands as reference points to correct the thermal mapping.

![Thermal overlay before calibration, offset from the person](/assets/projects/initiator-drone/calibration-before.jpg "Before"){: .small}
![Thermal overlay after calibration, lined up with face and hands](/assets/projects/initiator-drone/calibration-after.jpg "After"){: .small}

Thermal overlay before and after calibration, using the face and hands as reference points.
{: .caption}

Then I tuned what the operator actually sees:

- **Filled heat blobs** around warm bodies instead of scattered dots.
- **"Through walls":** heat the rig sees stays visible even when a wall blocks the phone's view. The phone shows what the rig observed; it isn't sensing heat through the wall itself.
- **No ghost trails:** highlights expire after 500 ms without a fresh reading, and old points are cleared when depth sees past where a person used to be.
- **A stable color scale** fixed at 19–28 °C, so colors don't jump when someone walks out of frame. The highlight threshold is adjustable; 23 °C worked for my test scene.

<video class="small" width="588" height="1280" poster="/assets/projects/initiator-drone/thermal-ar-demo-poster.jpg" controls preload="metadata" playsinline>
  <source src="/assets/projects/initiator-drone/thermal-ar-demo-web.mp4" type="video/mp4">
  <a href="/assets/projects/initiator-drone/thermal-ar-demo-web.mp4">View the thermal AR demo video</a>
</video>

Thermal AR on the iPhone: the rig's heat readings drawn over the phone's view of the room.
{: .caption}

When the phone camera kept freezing after a few seconds, I added on-device logging for camera stalls, timing, and tracking state. The app also stopped holding on to ARKit camera frames, which can starve ARKit of buffers; it now copies the data it needs and lets the frames go.

## Headset Passthrough

The app also has a headset mode for a MERGE phone headset: the AR camera and thermal view render once and are lens-corrected into both eyes, with touch zones on each half of the screen to toggle info or realign. It's monoscopic (the same image in both eyes), and the lens settings are tuned by hand rather than measured.

## Status

A working handheld prototype. Not done yet:

- tracking accuracy measured against ground truth,
- reliable human detection (the thermal threshold finds warm surfaces, not specifically people),
- a calibrated replacement gyro,
- and mounting it on a drone and flying it.

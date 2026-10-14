---
title: Automatic Resistor Sorter
dates: Apr 2024 – Jun 2024
details: Python, OpenCV, Scikit-learn, Roboflow, Raspberry Pi
summary: A Raspberry Pi, computer vision, and machine learning project for identifying resistor color bands and controlling a sorting mechanism.
---
A Grade 12 Computer Engineering project: a 3D-printed conveyor carries a resistor under a Raspberry Pi camera, the software reads its color bands and calculates its value, and the conveyor drops it into one of five bins by order of magnitude.

<video width="720" height="1280" poster="/assets/projects/resistor-sorter/resistor-sorter-demo-poster.jpg" controls preload="metadata" playsinline>
  <source src="/assets/projects/resistor-sorter/resistor-sorter-demo-web.mp4" type="video/mp4">
  <a href="/assets/projects/resistor-sorter/resistor-sorter-demo-web.mp4">View the resistor sorter demo video</a>
</video>

Demo clip from the integrated sorter workflow.
{: .caption}

## Team

- **Jinyuan Zhao (me):** computer vision, the color classifier, and the integration code that runs everything.
- **[Andrew Yong](https://www.linkedin.com/in/heng-yong-215927362/):** CAD, 3D printing, and the conveyor.
- **[Mary Li](https://www.linkedin.com/in/mary-li-74a986340/):** servo, solenoid relay, and button wiring and code.

![CAD model of the conveyor and sorter frame](/assets/projects/resistor-sorter/cad-model.png "CAD model"){: .medium}

Andrew's CAD model of the conveyor frame.
{: .caption}

## Finding a Detector That Worked

Reading color bands sounds simple; getting it to work on our resistors under our lighting was most of the project. I worked through several open-source attempts first:

- [ResistorsOpenCV](https://github.com/alhazmy13/ResistorsOpenCV) and [CVResist](https://github.com/SupreethRao99/CVResist): adapted from video to still images, but neither read our resistors.
- [ResistorSorter](https://github.com/elecclubiitg/ResistorSorter) from IIT Guwahati's Electronics Club: the code was hard to follow, but the [ETH Zürich paper](https://pub.tik.ee.ethz.ch/students/2014-HS/GA-2014-02.pdf) it was based on explained what works and what doesn't, which shaped my later approach.
- [OhmVision](https://github.com/dishonesthips/OhmVision): a clean codebase that became my starting point. It finds the resistor with a Haar cascade, then masks each color to find the bands.

OhmVision's own cascade missed our resistors entirely. [Lucas Moraes's cascade files](https://github.com/lucasmoraeseng/resistordetector) did better, but every cascade I tried only worked on 1 or 2 of my 7 test photos.

![OhmVision finding no resistor in a test photo](/assets/projects/resistor-sorter/ohmvision-miss.png "OhmVision cascade"){: .small}
![A Haar cascade detection drawn as a green box around a resistor](/assets/projects/resistor-sorter/haar-detection.jpg "Alternative cascade"){: .small}

OhmVision's cascade finds nothing; an alternative cascade boxes the resistor on one of the few photos it handled.
{: .caption}

The color masks were just as fragile. Changing my phone flashlight by one brightness level meant retuning them.

## Debug Tools

To tune the masks I wrote two small OpenCV tools. The first shows the image in HSV with sliders for each bound, plus the resulting mask, so I could dial in each color's range by eye.

![HSV slider tool isolating the blue band of a resistor](/assets/projects/resistor-sorter/hsv-tuner.png "HSV tuner"){: .large}

The second flood-fills from wherever the mouse is, then reports the area and the HSV range of that region and highlights everything else in the image that falls in the same range.

![Flood-fill tool reporting the HSV range of a hovered band](/assets/projects/resistor-sorter/floodfill-tool.png "Flood-fill inspector"){: .large}

## Switching to Machine Learning

After days of tuning cascades and masks, I switched to machine learning in two places.

**Finding the resistor.** I tested models on Roboflow Universe and settled on an existing resistor detection model. A Raspberry Pi is too slow to run it, so the Pi sends each photo to Roboflow's hosted API. It found the resistor in every photo I tried, regardless of background.

**Reading the colors.** I segmented individual bands out of my photos and labelled them: 45 band images in four colors (18 black, 9 brown, 12 orange, 6 red). A Scikit-learn KNN classifier (k = 3) on each band's average color scored 100% on its own test split and got about 9 in 10 right on bands it had never seen. More colors and more accuracy would have needed a few hundred more images.

## Final Pipeline

1. A button press triggers PiCamera2 to take a photo.
2. Roboflow returns the resistor's bounding box.
3. The code crops a thin horizontal strip through the middle of the resistor.

    ![Cropped strip across the resistor's bands](/assets/projects/resistor-sorter/cropped-strip.png "Cropped strip"){: .medium}

4. Preprocessing: a bilateral filter on each HSV channel smooths noise but keeps the band edges, and brightness is capped to cut glare.
5. Each pixel column is replaced by its median color, leaving clean vertical stripes.
6. The resistor's body color is masked out, so the remaining contours are the bands.

    ![Mask showing isolated black bands as white stripes](/assets/projects/resistor-sorter/band-mask-black.png "Band mask"){: .medium}

7. The KNN classifies each band; the bands are sorted left to right and converted to a resistance (3 to 6 bands, including tolerance and temperature coefficient).
8. The servo advances the conveyor one step per order of magnitude (1 step under 1 kΩ, up to 5 steps under 10 MΩ), then the solenoid pushes the resistor off into its bin.

![Detected resistor value displayed on a screen after vision processing](/assets/projects/resistor-sorter/resistor_read_on_screen.jpg){: .large}

An earlier version of the band reader labelling each band and calculating the value.
{: .caption}

One integration problem cost an hour: installing Roboflow's SDK pulled in a headless build of OpenCV that conflicted with mine. The only clean fix was to keep the headless version, which has no `imshow`, so to look at any debug image I had to commit it on the Pi, push, and pull it onto my laptop.

## Hardware

![Resistor positioned on the sorter conveyor belt](/assets/projects/resistor-sorter/resistor_on_belt.jpg "On the belt"){: .small}
![Servo motor wired to a Raspberry Pi for testing](/assets/projects/resistor-sorter/servo-test.jpg "Servo test"){: .small}

A resistor on the conveyor under the camera, and Mary's first servo test.
{: .caption}

Andrew printed every part on a Dremel 3D45 in PLA. He designed the parts flat so they needed no supports, and found that 0.1 mm clearance worked for fixed joints and 0.2 to 0.4 mm for moving parts. Printing still caused problems:

- **Layer shift:** the conveyor prints kept shifting. Our teacher, Mr. D'Alesio, traced it to the filament spool dragging hard enough to pull the print head back, and fixed it with a large washer and a screw.
- **A colorful belt:** Andrew tried coloring the white filament with markers. It looked good, but the colors confused the vision code, so the belt was reprinted in white.
- **Vandalism:** someone ripped the conveyor belt out of its support, so it had to be printed again. After that, the project lived in a box out of reach.

![3D print with severe layer shift](/assets/projects/resistor-sorter/layer-shift.jpg "Layer shift"){: .small}
![Failed 3D print from the resistor sorter mechanical prototyping process](/assets/projects/resistor-sorter/failed_print.jpg "Failed print"){: .small}

Layer shift on the conveyor parts, and another failed print.
{: .caption}

Mary wired the solenoid through a relay, running it from a 9 V battery instead of the 12 V in the reference diagram. The servo first skipped a section of the belt on each turn, so she halved its run time. The button wiring worked in early tests, then stopped, so she rewired it from a different diagram.

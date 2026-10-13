---
title: Automatic Resistor Sorter
dates: Apr 2024 – Jun 2024
details: Python, OpenCV, Scikit-learn, Roboflow, Raspberry Pi
summary: A Raspberry Pi, computer vision, and machine learning project for identifying resistor color bands and controlling a sorting mechanism.
order: 4
---
A Grade 12 Computer Engineering robotics project for identifying resistors on a custom conveyor, reading color bands, calculating values, and sorting parts.

## Role

My primary responsibilities were the computer vision software, machine learning model development for color-band identification, and the overall system integration logic. My teammates handled the mechanical design/fabrication and electromechanical actuation.

## Vision and ML Approach

The hardest part was reliable resistor color detection. I started with traditional OpenCV and Haar Cascade experiments, including HSV masks, sliders, flood fill, and segmented debug windows. Those methods were too sensitive to lighting and reflective resistor bands.

I eventually pivoted to a machine-learning based approach: Roboflow for resistor localization, followed by custom preprocessing and a Scikit-learn KNN classifier for color-band classification. The KNN model performed far better than the earlier rule-based attempts on the image sources used in the project.

## Integrated Workflow

1. A button press triggered PiCamera2 image capture.
2. The captured image was sent through object detection for resistor localization.
3. The detected resistor region was cropped and preprocessed.
4. Individual color bands were segmented and classified with the KNN model.
5. The resistor value was calculated and displayed as an overlay.
6. GPIO output controlled servo/solenoid hardware for sorting.

## Selected Visuals

![Resistor positioned on the sorter conveyor belt](/assets/projects/resistor-sorter/resistor_on_belt.jpg){: .medium}

Resistor positioned on the conveyor path before image capture and color-band classification.
{: .caption}

![Detected resistor value displayed on a screen after vision processing](/assets/projects/resistor-sorter/resistor_read_on_screen.jpg){: .large}

Vision output after detecting the resistor and calculating the value from its color bands.
{: .caption}

<video class="pics" controls preload="metadata" playsinline>
  <source src="/assets/projects/resistor-sorter/resistor-sorter-demo-web.mp4" type="video/mp4">
  <a href="/assets/projects/resistor-sorter/resistor-sorter-demo-web.mp4">View the resistor sorter demo video</a>
</video>

Demo clip from the integrated sorter workflow.
{: .caption}

![Failed 3D print from the resistor sorter mechanical prototyping process](/assets/projects/resistor-sorter/failed_print.jpg){: .large}

A failed print from the mechanical prototyping process, one of the hardware iteration points around the sorter body.
{: .caption}

## Outcomes

- Hands-on OpenCV experience for image preprocessing, masking, cropping, and debugging.
- Practical Scikit-learn experience on a real, messy classification problem.
- Hardware integration experience with Raspberry Pi camera capture and GPIO control.
- A clearer understanding of when rule-based vision becomes too brittle and ML is worth the pivot.

Okay, great! Let's move on to your Automatic Resistor Sorter project.

This sounds like a very hands-on project involving both software (Python, OpenCV, Scikit-Learn) and hardware (3D printing, Pi Camera).

Please tell me more about:

Project Motivation & Goal:

What led you to create an Automatic Resistor Sorter? Was it a personal project, for a course, a club activity, or something else?

> School project, I said before I did a bunch of projects in grade 12 computer engineering (robotics), and this is one of them

What was the main problem you wanted to solve or the primary objective? (e.g., to speed up resistor identification, to learn about computer vision and mechatronics, to sort a large collection of resistors).

> School! Also my teammate suggested that this would be fun, and we have a giant box of unsorted resistors in the back of the classroom lol

Design & Construction of the Conveyor System:

You "designed and 3D-printing a custom conveyor system with components like a drum, base, camera holder, and pushers."

Could you describe how this conveyor system worked? How did the drum, pushers, etc., interact to move and sort resistors?

> My teammate actually designed most of it...
> I can tell you how it works. So the conveyor belt at made with smaller chains, and each can be joined up by inserting filament in between the joints into a single conveyor. Each small chain block has 2 ridges, one on the inside for the drum, and one on the outside for holding the resistor. There's 2 drums in total. 
> For the pushers, initally we wanted 1 pusher for each slot but I realized I can just use 1 pusher connected via a giant 3d printed rectangle to push all at once (since you'd only have 1 resistor on the chain at any time anyways)

What software did you use for designing the 3D-printed parts (e.g., TinkerCAD, Fusion 360, SolidWorks)?

> teammate used onshape

What were some of the challenges in designing and printing these mechanical parts to function reliably?

> See document :)

Object Detection & Tracking:

You "developed and deployed an object detection model using Pi Camera and HaarCascade, enabling precise tracking of resistor locations."

How was the HaarCascade classifier trained or configured for detecting resistors? Or was it used for a different aspect of tracking?

How did the system track the "precise location" of resistors? Was it just identifying them in the camera's field of view, or tracking their movement along the conveyor?

Color Band Isolation & Identification:

"Isolated color bands on resistors by applying OpenCV for accurate image cropping around resistor locations."

Once a resistor was detected, what OpenCV techniques did you use to isolate and crop the color band regions? (e.g., contour detection, thresholding, morphological operations).

"Improved color detection accuracy by 100% by training a custom KNN model with SciKit-Learn, ensuring reliable resistor identification."

How did you collect training data for this KNN model? Did you manually label color band images?

What features were extracted from the cropped color band images to feed into the KNN model? (e.g., average color in HSV/RGB, color histograms).

How was the "100% improvement" measured? What was the baseline or previous method it was compared against? (If this is an estimate, we can rephrase to focus on the successful implementation of the KNN model for reliable identification).

> Previous model can't detect anything, now it can detect everything. lim_x->0 100/x should be infinity though so let's call it infinity% 

Overall System Integration & Performance:

How did all these components (conveyor, Pi Camera, object detection, color band analysis, KNN model, pushers) work together in a sequence?

What was the overall accuracy or speed of the resistor sorter in practice?

What was the most challenging part of integrating the software (computer vision, ML) with the physical hardware (conveyor, pushers)?

Learning & Outcomes:

What were your biggest takeaways from this project?

What new skills (technical or otherwise) did you develop?

Are there any photos or videos of the resistor sorter in action, or of the 3D-printed parts? These would be excellent for the website.

The more specific you can be about the "how" and the "why" behind your design choices and implementation steps, the better we can showcase your skills.

> See design document, which can answer




---




Collaboration Clarification:
It's clear Andrew Yong did the 3D modeling/printing and Mary Li did some of the hardware (motor/solenoid/button). For your website, how would you best describe your primary responsibilities versus theirs in a concise way for an overview? (e.g., "I focused on the computer vision software, machine learning model development, and overall system integration logic, while my teammates handled mechanical design/fabrication and electromechanical actuation.")

> CODING 
> Yes the one you wrote is correct

The "Aha!" Moment for Machine Learning:
Your document has a very engaging (and humorous) section about realizing ML was the way to go ("From the moment I understood the weakness of Haar Cascade, it disgusted me..."). Can we adapt a slightly more formal but still impactful version of this transition for the website? For example, "After extensively exploring traditional computer vision techniques like Haar Cascades and adaptive thresholding for color band detection, I encountered limitations in robustness, particularly with varying lighting and reflective surfaces. This led me to pivot towards a machine learning-based approach, which ultimately proved to be more reliable."


> definitely. I know my computer engineering teacher a lot and we know each other long enough that I can include a lot of jokes in my reports but yes concise writing is important


Quantifying the KNN Model for Bands:
You mentioned "100% certainty on the colors, but do take note that the 100% certainty is only for the pictures already in the folder" and "works around 9/10 times against the images containing the colors but was not used for training."
For the website, a good way to phrase this might be: "A K-Nearest Neighbors (KNN) model was trained on features extracted from segmented color bands. While the dataset was modest, the model demonstrated high accuracy (over 90%) in identifying the correct color for unseen bands from the same image source, significantly outperforming earlier rule-based methods." This is honest and still impressive.

> Yes

Key Challenges & Learnings (Your Perspective):
From your perspective working on the vision/ML side, what was the single biggest technical hurdle you overcame?
What was the most valuable lesson you learned about project development or a specific technology from this experience? (Your closing thought "never doubt machine learning again lol" is great, but maybe phrase it slightly differently for the website, e.g., "This project underscored the power and adaptability of machine learning for complex pattern recognition tasks where traditional algorithms might struggle.")

> The one I was stuck on for the longest was color detection
> See at the beginning I was using opencv and haarcascade which is ok ish under fixed lighting conditions, but the colors are just absolute nightmare. I had like a lot of separate windows open each with like hsv image, hsv sliders, mask, result, for each color... I even tried flood fill

Visuals:
The document includes images of:
3D model of the conveyor (Andrew's part).
Failed 3D prints (layer shift).
Your OpenCV debugging (detected resistor, HSV sliders, segmented bands).
The final CoolMachineLearning2.py output showing a bounding box.
The "One Code to Rule Them All" title card is fun!
Question: Do you have any photos of the actual, physical assembled resistor sorter? Or a short video of it attempting to sort? These would be gold for the website. If not, the CAD model and your software screenshots are still good.

> Yes, there are videos.

Which of the images from your document do you think would be most effective to include on the detailed project page? We can select 2-3 key ones.

> I can include all with subtitles, dont worry I can handle that
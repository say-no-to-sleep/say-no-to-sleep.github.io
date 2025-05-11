The Context & Challenge:

What was the specific FRC game or competition theme during the Sep '22 - June '24 period when you were heavily involved with the Orange Pi vision system? What were the primary game objects the robot needed to detect and manipulate?

> It's the 2024 one, called CRESCENDO, here's the wikipedia

```
Crescendo is played on a 27 feet (8.2 m) by 54 feet (16 m) field covered in grey carpet. The field is surrounded by low polycarbonate walls on the long sides and taller alliance station walls on the short sides. The two Amps on the long sides are connected to the alliance stations by a taller wall made of wire mesh panels.[3]

The field is divided in half by a white line, with each half including an alliance's Wing, Stage Zone, and Amp Zone and the other alliance's Source Zone. Alliances work to score Notes at their Speaker, located on the left side of their opponent's alliance station. Robots can also score Notes at their Amp on their side of the field. At the end of the match, robots move to their Stage and climb chains to earn additional points.[3]

Game Pieces
The only game piece in Crescendo is the Note. Notes are orange foam tori (rings) with a 10-inch (254 mm) inside diameter and 14-inch (356 mm) outside diameter with a thickness of 2 inches (50.8 mm). High Notes are a variety of Note and are marked by three equidistant pieces of white tape wrapped around the torus.[3]


A robot holding a Note.
Player Areas
Alliance Stations
There are two alliance stations on the short sides of the field, one for each alliance. Each station is divided into three smaller driver's stations where the teams that make up the alliance control their robots. In addition to the standard e-stop button, each driver's station now includes an autonomous stop (a-stop) that can be used to stop a robot during the autonomous period. Once the autonomous period ends, the a-stop expires and returns control of the robot to the team. The team number displays hung above the driver's stations have also been upgraded to support five-digit teams.[3]

Human Player Stations
The only type of human player station in Crescendo is the Source. The two Sources (one per alliance) are used by human players to introduce Notes into the field using a chute and are located on the other side of the field from an alliance's Alliance Station. Robots can navigate to the Source using two AprilTags mounted on the left and right sides of the chute. Even though the Amps are not fully classified as human player stations, a human player is usually present at each one for the duration of a match to earn the coopertition and amplification bonuses for their corresponding alliances. [3]

Scoring Areas
Amps
The two Amps are located on the same side of the field as their alliance's station. Once two Notes are scored in an Amp, a human player can press a button to amplify their alliance's Speaker points for ten seconds or until 4 notes are scored.[4] Once the amplification ends, another two Notes must be scored before it can be reactivated. If both alliances score a Note in their Amp in the first 45 seconds of the teleoperated period, they can press another button to earn coopertition bonus. A Note used to earn the bonus cannot be used to amplify the Speaker.[3]

Speakers
Each alliance has one Speaker located in between the left and center Alliance Stations of the opposing alliance. Each speaker includes an opening through which Notes can be scored, with the lowest edge of the opening 6.5 feet (2.0 m) above the carpet and the highest edge 6.9 feet (2.1 m) above the carpet. The opening is 3.42 feet (1.04 m) wide and extends 2.33 feet (0.71 m) into the field. Each Speaker also includes a Subwoofer that indicates whether the Speaker has been amplified and the amount of time left on the amplification. Alliances can earn the Melody Ranking Point (RP) by scoring at least 18 Notes (21 if the event is a district championship, 25 at the FIRST Championship) in the Amp and Speaker. This threshold is reduced to 15 Notes (18 if the event is a district championship, 21 at the FIRST Championship) if the coopertition bonus is earned.[3]


A side view of the Crescendo field showing the two STAGE truss structures.
Stages
The two Stages are three-legged trusses located 10.08 feet (3.07 m) from its corresponding Alliance Station. Each Stage includes a six-sided Core suspended approximately 2.33 feet (0.71 m) above the carpet and three metal chains connected between the legs of the truss. The chains droop to a height of 2.33 feet (0.71 m) above the carpet and rest 1.33 feet (0.41 m) away from the Core. The three wider sides of the Core also include a Trap where a Note can be scored, with the bottom of the Trap located 4.67 feet (1.42 m) above the carpet.[3]

During the endgame, robots can earn points by climbing on the chains. An alliance can also earn the Ensemble RP by scoring at least 10 Stage points while having at least two climbing robots. Harmony points can also be earned if two robots successfully climb on the same chain. If a human player successfully tosses a High Note onto one of three pegs (known as a Microphone) on top of the Stage, any robots directly below that Microphone are Spotlit and earn additional climb points.[3]
```

> So im trying to create a code that can use the camera to locate these notes, and while pressing the button will orient itself and automatically intake.

What was the state of the team's object detection capabilities before you led the integration of Orange Pi and PhotonVision? What were the limitations or problems you were trying to solve?

> It's mainly innovation I think. The last time someone even tried with vision in our team was a long time ago, so we ordered new orange pis to see what we can do with them. Since I was the robotic programming lead, I tried to implement the vision into it. 
>
> Actually I'll give you a spoiler. The system worked really well and it could pick up notes. BUT THE DRIVERS DIDNT PRACTICE SO THEY DONT KNOW HOW TO USE IT which lead to the cameras being removed from the 2nd competition onwards... 

Technical Implementation & Your Leadership:

You "led the team to integrate Orange Pi vision with PhotonVision and machine learning models."

What did your leadership role entail? Did you design the system architecture, assign tasks, troubleshoot major issues, or something else?

> It's basically all me to be honest. designed, trouble shoot, etc. 

What specific machine learning models were used for object detection? (e.g., a pre-trained model like YOLO, SSD, or something custom?)

> pre trained yolo on the objects that I yoinked from the forums, on a special install of photonvision on orange pi (which utilize its Rockchip)

What were the main technical hurdles you or the team faced during this integration? (e.g., hardware compatibility, software dependencies, model deployment on Orange Pi, calibration, real-time performance tuning).

> It's mainly the software I think. We got the orange pi fairly early on so I can play with it. Getting the photonvision right took a while for me to find the resources
>
> Chiefdelphi is very good, I fouynd a orange pi guide for photonvision 2023 doicument which helped me greatly
>
> Also one time I had to wait for a new photonvision update for orangepi 5, but then I found a photonvision rknn fork 
>
> https://github.com/laviRZ/photonvision
> https://github.com/laviRZ/photonvision/blob/master/rknn-readme.md
>
> This was actually really useful.

How did PhotonVision fit into this setup? What was its role alongside the Orange Pi and the ML models?

> It's mainly just Photonvision. The photonvision outputs the location of them to the robot, and the robot moves, and the photonvision ouputs location again, and robots move, repeat until note is captured.

Impact & Results:

The "50% speed increase in object pickup" is a great quantifiable result. Could you elaborate on how this was measured? Was it a reduction in time to detect and align, or a faster cycle time for the pickup mechanism itself once an object was identified?

> It's fake, who tf knows because I didn't measure... I needed to have some kind of "quantity" on the resume so I bullshitted a number.

Were there any other qualitative or quantitative improvements observed (e.g., accuracy of detection, ability to detect in varied lighting conditions, reduced driver error)?

> nope! lighting is always gonna be good because it's a frc field so didn't really test that

Knowledge Transfer & Mentorship:

You "developed a sustainable knowledge base by mentoring 5 grade 10 students on Orange Pi technology."

What specific topics or skills related to Orange Pi did you teach them? (e.g., Linux basics, Python programming for hardware, using specific libraries, deploying ML models on the Orange Pi).

> Linux basics, how to use the orange pi, how to install photonvision, how to get it working in the java code (we using java for robot), etc

What was your mentorship approach? Did you run workshops, provide one-on-one guidance, create learning materials?

> create materials, and also our robot team teacher was like "you're gonna be gone next year, here have some students willing to learn and teach them" and I teach them as a group

How did you ensure they were "proficient enough to contribute"? Did they work on specific sub-tasks or mini-projects?

> No. A lot of it were selt taught. Also This year I checked in with them and lo and behold they were able to implement even more complicated things than me (Odometry) using cameras.

Documentation:

You "enhanced team efficiency by authoring detailed Orange Pi documentation."

What key areas did this documentation cover? (e.g., setup guides, programming tutorials, troubleshooting common issues, best practices for using the vision system).

> I'll lead in with a secret to you- that documentation isnt complete and only covered up to setup as well as simple usage.

How did this documentation concretely reduce onboarding time by 30%? Did new members refer to it directly, or did it help experienced members train new ones more effectively?

> I am not sure, again that number was bullshitted by me




---

Question 1: When the system was working during your development and testing (before the drivers decided not to use it in later competitions), did you observe any qualitative improvements in how the robot interacted with the "Notes"? For example, did it seem like the robot could align to a Note more consistently or perhaps a bit faster with vision assistance compared to purely manual driving, even if only in practice or initial tests? (No need for exact numbers, just your observation of its potential.)

> Success arrived suddenly - One moment it wasn't working and the other it was working well so there was no need to modify.
> The driving integration code was actually integrated by our team captain (last year's programming lead) who was doing the drive code. I provided her my part of the code with vision, and she did the drivetrain integration with the vision module.
> Unfortunately I was not part of the driving team, so even though in my testing it was pretty good, I'm not sure exactly why they removed it (and didn't tell me, I only noticed when the camera got removed on the robot)

Question 2: Was the primary benefit of the vision system intended to be fully autonomous pickup, or driver-assisted targeting (e.g., the driver gets close, presses a button, and the vision system fine-tunes the alignment for intake)?

> So the ideal is definitely autonomous pickup like other groups, but it ended up being a fine tune system because
> 1: lack of time for development
> 2: lack of skill
> 3: no idea how to implement it

Question 3: Even if the documentation you created for Orange Pi setup and simple usage wasn't "complete," did providing this initial material help the Grade 10 students get started more quickly or with fewer initial roadblocks than if they had no guide at all from you?

> Yes... kind of. I don't remember exactly but there was 1 student called Ian who followed it, and he started learning new stuff. Again my information is limited
> 
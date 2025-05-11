Project Motivation & Goal:
What inspired this project? Was it for a course, a personal interest, or preparation for a specific field?

> Course. ECE 198 Requires us to use 2 STM32 and link them for communication-- that's the bare minimum and we are required to have creativity for this.

What was the primary problem you were trying to solve or the main objective you wanted to achieve with this secure ECG system?

> Not really a real problem. But we were required to invent like a problem and solution and stuff

System Architecture & Components:
Could you describe the overall flow of data in your system? From heart signal simulation to encrypted transmission, and then decryption and display.



STM32-F446RE Microcontroller: What were its specific roles? (e.g., signal acquisition/simulation, running the TEA encryption, UART communication, I2C communication).



Tiny Encryption Algorithm (TEA): Why did you choose TEA for encryption? Were there any specific challenges in implementing it on the STM32?



UART1 Single-Wire Communication: Why single-wire? What were the considerations for ensuring accurate transmission at 115.2 Kbps?



SSD1306 OLED Display: How was the data formatted or processed for display on the OLED? What key information was shown?



Potentiometer for Heart Signal Simulation: How did the potentiometer simulate heart signals? Did you map its values to specific ECG waveform characteristics (e.g., QRS complex, P wave, T wave), or was it a more general representation of varying signals?
Key Technical Challenges & Solutions:
What was the most challenging aspect of this project? (e.g., debugging the encryption/decryption, getting the UART or I2C communication to work reliably, managing real-time constraints).
How did you overcome this challenge? Describe your troubleshooting or development process for that part.
Learning & Outcomes:
What are the most significant things you learned from building this system (technical or otherwise)?
Are there any next steps or future improvements you envision for this project?
Do you have any diagrams, photos of the setup, or code snippets you're particularly proud of that could be included on the project page? (If so, describe them, and you can add them to your assets/images/ folder later).

"Oct 2024 - Present":
Since this project is ongoing, what are you currently working on, or what are the immediate next steps?

> Forgot to change this, it ended in dec 2024.

I think most of these can be answered with my design proposal and design document, so I linked them below.

Please ask me more  questions if you have any


---


Your Specific Role & Contributions:
Since this was a team project with Vishnu Ajit, could you describe which specific parts of the design, implementation, or troubleshooting you were primarily responsible for? (e.g., did you focus more on the transmitter side, receiver side, encryption algorithm implementation, hardware interfacing, debugging specific modules like UART or I2C?)

> I focused on communication side and he focused more on algorithm implementation 

Deep Dive into Technical Choices & Implementation:
TEA Implementation: The documents state TEA was chosen for security. Was this an algorithm you researched and selected, or was it suggested/required by the course? What was your experience implementing the 32 cycles of XOR, ADD, and SHIFT operations on the STM32?

> Selected this ourselves because it's easy to implement
> No experience with the cycles of XOR, ADD, SHIFT, etc, just copy pasted the code and changed it so its working

UART Single-Wire: The choice for single-wire half-duplex is noted for efficiency. Were there any particular challenges in ensuring reliable communication over a single wire, especially concerning timing or noise, even at 115.2 Kbps?

> So actually it was discovered that me and my partner wasn't using the exact same model of esp32. This proved problematic in some areas like the clock speeds. His model didn't support as high as mine, which supported up to above 180 MHz. So I had to lower mine to match his speed. 

Potentiometer Simulation: The proposal mentions "3-5 peaks and troughs." In practice, how did you generate these? Was it a manual twisting to create arbitrary varying signals, or did you try to follow a more structured pattern to crudely represent an ECG's PQRST waves?

> Yes we manually twisted the potentiometer. but attempted to "emulate" some of the heartbeat ecg shape you would typically see

Dual OLED Displays: The diagrams suggest one OLED on the transmitter and one on the receiver.
What exactly did the transmitter's OLED display show (e.g., the raw ADC values, the encrypted data in hex, a status message)?

> The transmitter's OLED showed a graph where the horizontal axis is time and vertical axis is the potentiometer value from min to max. Upon pressing a button it could show the current encrypted value to compare with the receiver

What did the receiver's OLED display show (e.g., the decrypted numerical values, an attempt to plot a simple waveform)?

> Same thing as transmitter, with the button to show encrypted values.

Challenges & Problem-Solving (The "Real Story"):
Beyond the planned design, what was the most unexpected technical challenge you encountered during the hands-on building and testing of this system?

> Our first problem I think was that it wasn't connecting properly. It could send something but it was gibberish. 
> The second problem was that after connecting properly, I tried to add encryption and decryption. But it wouldnt show the gibberish in the debug console.
> The rest were smooth sailing, apologies I can't get more details

How did you and your partner approach troubleshooting this (or any other significant) issue? Can you describe a specific debugging process you went through?

> (dont write this) First we started doing actual reserch, then after frustration of not being able to solve it, resorted to vibe coding where we copy paste code and error to Claude and pray it fixes it (sometimes LLMs make it worse but) and it worked out OK...

Learning & Personal Outcomes:
What are the 1-2 most important technical skills you believe you strengthened or learned through this ECE 198 project?

> Uhh teamwork I guess
> But maybe also report writing skills

What did you learn about the process of designing an embedded system, from proposal to (simulated) application?

> not. a lot. I did this stuff dozens of times before in high school 

Considering the "secure data transmission" aspect, did this project spark any further interest in cybersecurity or data privacy in embedded systems?

> Cybersecurity no, data privacy no, embedded systems no... but kind of

Visuals for the Website:
You have diagrams in your design document. Are there any photos of your actual hardware setup (the two STM32 boards, potentiometer, OLEDs wired up) that you could share? Real photos can be very engaging.

> I have them yes. I have a lot of videos as well, maybe we can include them at the end of the page like media

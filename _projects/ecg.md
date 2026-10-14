---
title: Secure ECG Data Transmission System
dates: Oct 2024 – Dec 2024
details: C, STM32 HAL, UART, I2C
summary: Two STM32 microcontrollers transmitting simulated ECG data with encryption, UART communication, and OLED display output.
order: 4
---
An ECE 198 (Project Studio) team project with [Vishnu Ajit](https://www.linkedin.com/in/vishnu-ajit-a56760283/): two STM32 microcontrollers that send a simulated ECG signal from one board to the other, encrypted, and draw it as a scrolling trace on OLED screens. The code is on [GitHub](https://github.com/YeehawMcfly/ECE198-STM32).

## System Overview and My Role

Our design document framed the client as the cardiology clinic of Sunnybrook's Schulich Heart Program, where heart data moving between devices has to stay private under Ontario's health privacy law (PHIPA). The project was a small proof of concept for that: read a signal, encrypt it, send it to a second device, and decrypt and display it there.

The system used an STM32F446RE as the transmitter and an STM32F401RE as the receiver. My primary responsibility was the communication layer between the boards, while my partner focused more on the algorithmic implementation and encryption details.

![Circuit diagram of the two STM32 boards, potentiometer, and OLED displays](/assets/projects/ecg/circuit-diagram.png "Circuit diagram"){: .large}

The potentiometer feeds the transmitter's ADC; one wire carries UART between the boards, and each board drives its own SSD1306 OLED over I2C.
{: .caption}

## Data Flow

1. The transmitter reads a potentiometer on its 12-bit ADC (0 to 3.3 V). Turning it by hand stands in for the peaks and troughs of an ECG signal.
2. The reading is scaled to a row on the 64-pixel-tall screen. That one byte is padded into an 8-byte block and encrypted with the Tiny Encryption Algorithm (TEA: 32 rounds, 128-bit key).
3. The encrypted block is sent over single-wire, half-duplex UART at 115,200 baud, using interrupts so the main loop keeps sampling. This repeats continuously.
4. The receiver catches each block with an interrupt, decrypts it, and draws the point.

![Signal flow from potentiometer through encryption, UART, and decryption to the displays](/assets/projects/ecg/signal-flow.png "Signal flow"){: .medium}
![Flowchart of the firmware's main loop, interrupts, and transmission](/assets/projects/ecg/code-flowchart.png "Code flowchart"){: .medium}

The signal path, and the firmware's main loop and interrupt callbacks.
{: .caption}

## Displays

Both boards draw the signal as a scrolling trace, like an ECG monitor. I added two functions to the SSD1306 OLED driver for this: one shifts the whole screen one pixel left, and the other draws a vertical line in the new rightmost column from the previous point to the current one.

Each board's blue user button switches what its screen shows:

- **Transmitter:** the scrolling trace, or the current voltage and screen row as text.
- **Receiver:** the decrypted trace, or the raw encrypted bytes as they arrive, which makes the encryption visible.

## Testing

We built and checked each part as its own small project before combining them: ADC input from the potentiometer, the OLED on each board, encryption over UART, and finally the full system. This followed the test plan in our design document, which set pass criteria for voltage sampling (within ±5% of a multimeter reading), encryption against precomputed values, transmission, decryption, and both displays.

![STM32-based ECG data transmission project setup with connected electronics](/assets/projects/ecg/IMG_5886.jpg){: .large}

Vishnu debugging the boards in STM32CubeIDE.
{: .caption}

## Challenge

The first major problem was unreliable UART output. Data could be sent, but it arrived as gibberish. Through debugging, we found that the two STM32 boards had different clock-speed constraints: the F446RE can run at 180 MHz, but the F401RE tops out at 84 MHz. I lowered my transmitter clock configuration to match the receiver board, so both run at 84 MHz, which stabilized the communication link.

## Limitations

This was a classroom proof of concept, not a secure medical device:

- A potentiometer stands in for a real ECG sensor; a production version would use something like the SparkFun AD8232 heart monitor.
- The encryption key is hard-coded into both boards.
- TEA was chosen because it is small enough to implement and run on a microcontroller, but it has known weaknesses and isn't used where real security matters.

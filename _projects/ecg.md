---
title: Secure ECG Data Transmission System
dates: Oct 2024 – Dec 2024
details: ECE 198 Project Studio
summary: Two STM32 microcontrollers transmitting simulated ECG data with encryption, UART communication, and OLED display output.
order: 3
---
Team project with Vishnu Ajit using two STM32 microcontrollers to transmit simulated ECG data securely between devices.

## System Overview and My Role

For ECE 198, my partner and I designed a system for secure transmission of simulated electrocardiogram data. The project premise was protecting sensitive healthcare data while communicating readings between embedded devices.

The system used an STM32F446RE as the transmitter and an STM32F401RE as the receiver. My primary responsibility was the communication layer between the boards, while my partner focused more on the algorithmic implementation and encryption details.

## Data Flow

1. A potentiometer connected to the transmitter ADC was manually adjusted to generate analog voltage changes that roughly emulated ECG waveform peaks and troughs.
2. The transmitter digitized the signal and encrypted the data using the Tiny Encryption Algorithm, chosen because it was simple enough for the project scope.
3. The encrypted data was transmitted to the receiver using single-wire half-duplex UART.
4. The receiver decrypted the incoming data, and both boards displayed graph/value information on SSD1306 OLED displays over I2C.

## Selected Visual

![STM32-based ECG data transmission project setup with connected electronics](/assets/projects/ecg/IMG_5886.jpg){: .large}

Embedded hardware setup used for the simulated ECG data transmission workflow between the STM32 boards.
{: .caption}

## Challenge

The first major problem was unreliable UART output. Data could be sent, but it arrived as gibberish. Through debugging, we found that the two STM32 boards had different clock-speed constraints. I lowered my transmitter clock configuration to match the receiver board, which stabilized the communication link.

## Outcomes

- Practical experience setting up and troubleshooting UART communication between microcontrollers.
- Experience combining ADC input, encryption, serial transfer, and OLED display output into one embedded workflow.
- Practice dividing team responsibilities and writing technical project documentation.

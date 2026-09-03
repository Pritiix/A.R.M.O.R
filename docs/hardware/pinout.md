# ESP32 Pin Assignment — A.R.M.O.R. Rover

## Motor Driver (L298N)

| L298N Pin | ESP32 GPIO | Function |
|---|---|---|
| IN1 | GPIO 26 | Left motors direction A |
| IN2 | GPIO 27 | Left motors direction B |
| IN3 | GPIO 14 | Right motors direction A |
| IN4 | GPIO 12 | Right motors direction B |
| ENA | GPIO 25 | Left motors PWM speed |
| ENB | GPIO 13 | Right motors PWM speed |

## Sensors

| Sensor | ESP32 GPIO | Interface |
|---|---|---|
| MQ-2 (AO) | GPIO 34 | ADC1_CH6 (analog) |
| DHT11 (DATA) | GPIO 4 | Digital (OneWire) |
| LDR (AO) | GPIO 35 | ADC1_CH7 (analog) |

## Outputs

| Component | ESP32 GPIO | Type |
|---|---|---|
| Buzzer | GPIO 23 | Digital output |
| LED Left | GPIO 21 | Digital output |
| LED Right | GPIO 22 | Digital output |

## Camera (ESP32-CAM — separate module)

The ESP32-CAM is a separate unit with its own Wi-Fi stack.
It streams MJPEG independently to the backend/frontend.

| ESP32-CAM Pin | Usage |
|---|---|
| GPIO 0 | Boot mode (FLASH) |
| GPIO 4 | Onboard flash LED |

## Power Rails

| Rail | Source |
|---|---|
| 5V logic | L298N onboard regulator |
| 3.3V | ESP32 onboard LDO |
| Motor voltage | Battery 6–9V direct |

> ⚠️ GPIO 34 and 35 are input-only pins on ESP32. Do not use as output.  
> ⚠️ GPIO 12 must be LOW during boot to avoid boot failure.

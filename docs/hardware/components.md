# Hardware Components

## Main Controller
- **ESP32 (30-pin WROOM-32)**
  - Dual-core 240MHz Xtensa LX6
  - 4MB Flash, 520KB SRAM
  - Wi-Fi 802.11 b/g/n, Bluetooth 4.2
  - 34 GPIO pins
  - 12-bit ADC (18 channels)
  - I2C, SPI, UART, PWM

## Camera
- **ESP32-CAM (AI-Thinker)**
  - OV2640 camera (2MP, up to 1600×1200)
  - On-board 4MB PSRAM
  - microSD card slot
  - Streaming over HTTP/MJPEG

## Motor Driver
- **L298N Dual H-Bridge**
  - 2× full H-bridge
  - Controls 4× BO geared motors (2 per side via parallel wiring)
  - PWM speed control
  - Logic: 5V, Motor: 6–12V

## Drive System
- **4× BO Geared Motors (130-type, ~1:48 gear ratio)**
  - Tracked chassis configuration
  - Left side: Motor 1 + Motor 2 (parallel)
  - Right side: Motor 3 + Motor 4 (parallel)

## Sensors
- **MQ-2** — Smoke & combustible gas (analog, ADC)
  - ⚠️ Prototype use only. Not a certified gas meter.
- **DHT11** — Temperature (0–50°C) & Humidity (20–90% RH)
- **LDR Module** — Ambient light (analog)

## Outputs
- **Buzzer (active)** — Audible hazard alerts (GPIO)
- **2× 3V LEDs** — Front illumination (GPIO)

## Power
- Battery pack (7.4V LiPo or 4× AA)
- L298N onboard 5V regulator for ESP32 logic

---

## Sensor Extensibility

The software architecture supports future sensor additions:

| Sensor | Purpose | Interface |
|---|---|---|
| MQ-4 | Methane (CH4) | ADC |
| MQ-7 | Carbon Monoxide | ADC |
| MQ-135 | Air quality | ADC |
| BME280 | Temp/Humidity/Pressure | I2C |
| HC-SR04 | Ultrasonic distance | GPIO |
| MPU-6050 | IMU (tilt/acceleration) | I2C |
| GPS Neo-6M | GPS position | UART |

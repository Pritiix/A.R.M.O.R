/*
 * A.R.M.O.R. Firmware — Configuration Header
 * All hardware pin assignments and settings in ONE place.
 */
#pragma once

// ─── Wi-Fi ──────────────────────────────────────────────────────────────────
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"
#define BACKEND_HOST    "192.168.1.xxx"  // FastAPI backend IP
#define BACKEND_PORT    8000
#define ROVER_ID        "ARMOR-01"
#define MISSION_ID      "MISSION-001"

// ─── Timing ──────────────────────────────────────────────────────────────────
#define TELEMETRY_INTERVAL_MS  1000  // Send telemetry every 1 second

// ─── Motor Driver (L298N) ────────────────────────────────────────────────────
#define MOTOR_IN1   26   // Left motors direction A
#define MOTOR_IN2   27   // Left motors direction B
#define MOTOR_IN3   14   // Right motors direction A
#define MOTOR_IN4   12   // Right motors direction B
#define MOTOR_ENA   25   // Left motors PWM
#define MOTOR_ENB   13   // Right motors PWM

// ─── Sensors ─────────────────────────────────────────────────────────────────
#define MQ2_PIN     34   // ADC1_CH6 — input only
#define DHT11_PIN    4   // Digital OneWire
#define LDR_PIN     35   // ADC1_CH7 — input only

// ─── Outputs ─────────────────────────────────────────────────────────────────
#define BUZZER_PIN  23
#define LED_LEFT    21
#define LED_RIGHT   22

// ─── MQ-2 Thresholds (prototype, not certified) ──────────────────────────────
#define MQ2_WARNING_RAW   300
#define MQ2_CRITICAL_RAW  600

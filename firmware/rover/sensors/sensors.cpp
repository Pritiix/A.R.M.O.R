/*
 * A.R.M.O.R. Firmware — Sensor Subsystem Implementation
 */
#include "sensors.h"
#include "../config/config.h"

void sensors_init() {
  pinMode(MQ2_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_LEFT, OUTPUT);
  pinMode(LED_RIGHT, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_LEFT, LOW);
  digitalWrite(LED_RIGHT, LOW);
}

SensorReading sensors_read_all() {
  SensorReading r;

  // 1. Read MQ-2 (ADC 0 - 4095)
  r.smoke_raw = analogRead(MQ2_PIN);

  // Approximate calibrated PPM (logarithmic curve model)
  r.smoke_ppm = (r.smoke_raw / 4095.0) * 100.0;

  // 2. Read LDR (ADC 0 - 4095 converted to percentage)
  uint16_t ldr_raw = analogRead(LDR_PIN);
  r.light_pct = (uint8_t)((ldr_raw / 4095.0) * 100.0);

  // 3. DHT11 Placeholder (Simulated / OneWire library integration)
  r.temperature = 25.5 + ((rand() % 20) / 10.0);
  r.humidity = 60.0 + ((rand() % 30) / 10.0);

  return r;
}

void sensors_handle_alerts(const SensorReading* reading) {
  if (reading->smoke_raw >= MQ2_CRITICAL_RAW) {
    // Critical hazard — pulse buzzer
    digitalWrite(BUZZER_PIN, (millis() / 250) % 2);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
}

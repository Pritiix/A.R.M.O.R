/*
 * A.R.M.O.R. Firmware — Sensor Subsystem Header
 * Hardware: MQ-2, DHT11, LDR
 */
#pragma once
#include <Arduino.h>

struct SensorReading {
  float temperature;
  float humidity;
  uint16_t smoke_raw;
  float smoke_ppm;
  uint8_t light_pct;
};

void sensors_init();
SensorReading sensors_read_all();
void sensors_handle_alerts(const SensorReading* reading);

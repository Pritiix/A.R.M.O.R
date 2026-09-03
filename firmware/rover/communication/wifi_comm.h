/*
 * A.R.M.O.R. Firmware — Wi-Fi Communications Header
 */
#pragma once
#include <Arduino.h>
#include "../sensors/sensors.h"

void wifi_connect();
void wifi_send_telemetry(const SensorReading* reading);
void wifi_poll_commands();

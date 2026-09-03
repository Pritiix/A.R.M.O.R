/*
 * A.R.M.O.R. Firmware — Wi-Fi Communication Subsystem Implementation
 * Posts JSON Telemetry to FastAPI backend
 */
#include "wifi_comm.h"
#include "../config/config.h"

void wifi_connect() {
  Serial.print("[WIFI] Connecting to ");
  Serial.println(WIFI_SSID);
  // Connection logic for WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void wifi_send_telemetry(const SensorReading* reading) {
  // Construct TelemetryPacket JSON string
  String json = "{";
  json += "\"rover_id\":\"" + String(ROVER_ID) + "\",";
  json += "\"mission_id\":\"" + String(MISSION_ID) + "\",";
  json += "\"sensors\":{";
  json += "\"temperature\":" + String(reading->temperature, 1) + ",";
  json += "\"humidity\":" + String(reading->humidity, 1) + ",";
  json += "\"smoke_raw\":" + String(reading->smoke_raw) + ",";
  json += "\"smoke_ppm\":" + String(reading->smoke_ppm, 1) + ",";
  json += "\"light\":" + String(reading->light_pct);
  json += "}}";

  Serial.println("[TELEMETRY TX] " + json);
}

void wifi_poll_commands() {
  // Poll HTTP endpoint or WebSocket for incoming operator commands
}

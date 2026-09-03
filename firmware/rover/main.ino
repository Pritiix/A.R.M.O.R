/*
 * A.R.M.O.R. — ESP32 Main Firmware
 * Autonomous Reconnaissance & Mine Operation Rover
 *
 * Hardware:
 *   - ESP32 (30-pin WROOM-32) — Main controller
 *   - L298N — Motor driver (4x BO motors)
 *   - MQ-2  — Smoke/combustible gas sensor (prototype, not certified)
 *   - DHT11 — Temperature & Humidity
 *   - LDR   — Light level
 *   - Buzzer — Audible alert
 *   - 2x LED — Front lighting
 *   - ESP32-CAM — Separate module, streams independently
 *
 * Communication:
 *   - Wi-Fi → FastAPI backend via HTTP POST (telemetry)
 *   - Receives commands via WebSocket or HTTP
 *
 * NOTE: This is a stub — Phase 9 will complete the implementation.
 *
 * License: MIT
 */

#include "config/config.h"
#include "sensors/sensors.h"
#include "motors/motors.h"
#include "communication/wifi_comm.h"

void setup() {
  Serial.begin(115200);
  Serial.println("[ARMOR] Booting A.R.M.O.R. Rover Firmware v0.1.0");

  // Initialize subsystems
  motors_init();
  sensors_init();
  wifi_connect();

  Serial.println("[ARMOR] All systems ready.");
}

void loop() {
  // 1. Read all sensors
  SensorReading reading = sensors_read_all();

  // 2. Send telemetry to backend
  wifi_send_telemetry(&reading);

  // 3. Check for incoming commands
  wifi_poll_commands();

  // 4. Handle buzzer/LED state
  sensors_handle_alerts(&reading);

  delay(TELEMETRY_INTERVAL_MS);
}

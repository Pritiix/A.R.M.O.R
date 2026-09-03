/*
 * A.R.M.O.R. Firmware — Motor Control
 * L298N dual H-bridge for 4x BO geared motors
 * Left side: Motor1 + Motor2 (parallel on IN1/IN2/ENA)
 * Right side: Motor3 + Motor4 (parallel on IN3/IN4/ENB)
 * Phase 9 will complete the full implementation.
 */
#pragma once
#include "config/config.h"

void motors_init();
void motors_forward(uint8_t speed);   // speed 0-255
void motors_backward(uint8_t speed);
void motors_turn_left(uint8_t speed);
void motors_turn_right(uint8_t speed);
void motors_stop();
void motors_emergency_stop();

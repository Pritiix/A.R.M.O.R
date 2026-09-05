#!/usr/bin/env python3
"""A.R.M.O.R. real-time person detection and sensor-fusion engine.

The engine consumes an ESP32-CAM MJPEG stream (or webcam 0), receives the
backend's telemetry feed, and sends person-detection alerts to the same
WebSocket endpoint.  All operational settings can be overridden with
environment variables; see ``EngineConfig.from_environment``.
"""

from __future__ import annotations

import asyncio
import contextlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import logging
import os
import queue
import signal
import threading
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional, Union

import cv2
import websockets
from ultralytics import YOLO


LOG = logging.getLogger("armor.ai_engine")


def _env_float(name: str, default: float) -> float:
    """Read a finite float environment variable, failing early if malformed."""
    value = os.getenv(name)
    if value is None or not value.strip():
        return default
    try:
        result = float(value)
    except ValueError as exc:
        raise ValueError(f"{name} must be a number; received {value!r}") from exc
    if result != result or result in (float("inf"), float("-inf")):
        raise ValueError(f"{name} must be finite")
    return result


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_port(name: str, default: int) -> int:
    value = os.getenv(name, str(default))
    try:
        port = int(value)
    except ValueError as exc:
        raise ValueError(f"{name} must be a valid TCP port") from exc
    if not 1 <= port <= 65535:
        raise ValueError(f"{name} must be between 1 and 65535")
    return port


@dataclass(frozen=True)
class EngineConfig:
    camera_source: Union[str, int]
    websocket_url: str
    model_path: str
    confidence_threshold: float
    temperature_warning_c: float
    temperature_critical_c: float
    gas_raw_threshold: float
    gas_ppm_threshold: float
    telemetry_stale_seconds: float
    alert_cooldown_seconds: float
    preview: bool
    stream_host: str
    stream_port: int

    @classmethod
    def from_environment(cls) -> "EngineConfig":
        # An empty CAMERA_URL intentionally selects the attached local webcam.
        camera_url = os.getenv("CAMERA_URL", "").strip()
        return cls(
            camera_source=camera_url if camera_url else 0,
            # WS_ENDPOINT is the deployment-facing name. TELEMETRY_WS_URL is
            # retained as a backwards-compatible fallback for existing setups.
            websocket_url=os.getenv(
                "WS_ENDPOINT",
                os.getenv("TELEMETRY_WS_URL", "ws://localhost:8000/ws/telemetry"),
            ).strip(),
            model_path=os.getenv("YOLO_MODEL_PATH", "yolov8n.pt").strip(),
            confidence_threshold=_env_float("YOLO_CONFIDENCE_THRESHOLD", 0.50),
            temperature_warning_c=_env_float("TEMPERATURE_WARNING_C", 35.0),
            temperature_critical_c=_env_float("TEMPERATURE_CRITICAL_C", 45.0),
            gas_raw_threshold=_env_float("MQ2_HAZARD_RAW_THRESHOLD", 300.0),
            gas_ppm_threshold=_env_float("MQ2_HAZARD_PPM_THRESHOLD", 50.0),
            telemetry_stale_seconds=_env_float("TELEMETRY_STALE_SECONDS", 5.0),
            alert_cooldown_seconds=_env_float("ALERT_COOLDOWN_SECONDS", 5.0),
            preview=_env_bool("SHOW_PREVIEW"),
            stream_host=os.getenv("VISION_STREAM_HOST", "127.0.0.1").strip(),
            stream_port=_env_port("VISION_STREAM_PORT", 8081),
        )


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class LatestTelemetry:
    """Stores the most recently received canonical telemetry packet."""

    def __init__(self) -> None:
        self.packet: Optional[dict[str, Any]] = None
        self.received_at: Optional[float] = None

    def update_from_message(self, message: Any) -> bool:
        """Accept either the backend's envelope or a direct telemetry packet."""
        if not isinstance(message, dict):
            return False
        if message.get("event") == "telemetry" and isinstance(message.get("data"), dict):
            packet = message["data"]
        elif isinstance(message.get("sensors"), dict):
            packet = message
        else:
            return False
        self.packet = packet
        self.received_at = time.monotonic()
        return True

    def fusion_inputs(self, config: EngineConfig) -> dict[str, Any]:
        """Normalize supported DHT11/MQ-2 packet variants for late fusion."""
        packet = self.packet or {}
        sensors = packet.get("sensors") if isinstance(packet.get("sensors"), dict) else packet
        dht11 = sensors.get("dht11") if isinstance(sensors.get("dht11"), dict) else {}
        mq2 = sensors.get("mq2") if isinstance(sensors.get("mq2"), dict) else {}

        temperature = _first_number(
            sensors.get("temperature"), dht11.get("temperature"), packet.get("temperature")
        )
        smoke_raw = _first_number(
            sensors.get("smoke_raw"), mq2.get("smoke_raw"), sensors.get("gas_raw"), packet.get("gas")
        )
        smoke_ppm = _first_number(
            sensors.get("smoke_ppm"), mq2.get("smoke_ppm"), sensors.get("gas_ppm")
        )
        gas_status = str(
            sensors.get("smoke_status", mq2.get("status", sensors.get("gas_status", "NORMAL")))
        ).upper()
        explicit_gas = any(
            value is True
            for value in (sensors.get("gas_detected"), sensors.get("hazardous_gas"), packet.get("gas_detected"))
        )
        fresh = (
            self.received_at is not None
            and time.monotonic() - self.received_at <= config.telemetry_stale_seconds
        )
        temperature_warning = (
            temperature is not None and temperature > config.temperature_warning_c
        )
        temperature_critical = (
            temperature is not None and temperature > config.temperature_critical_c
        )
        hazardous_gas = (
            explicit_gas
            or gas_status in {"WARNING", "CRITICAL", "HAZARDOUS", "DANGER"}
            or (smoke_raw is not None and smoke_raw >= config.gas_raw_threshold)
            or (smoke_ppm is not None and smoke_ppm >= config.gas_ppm_threshold)
        )
        return {
            "telemetry_fresh": fresh,
            "temperature_c": temperature,
            "temperature_warning": temperature_warning,
            "temperature_critical": temperature_critical,
            "smoke_raw": smoke_raw,
            "smoke_ppm": smoke_ppm,
            "gas_status": gas_status,
            "hazardous_gas": hazardous_gas,
            "rover_id": packet.get("rover_id"),
            "mission_id": packet.get("mission_id"),
        }


def _first_number(*values: Any) -> Optional[float]:
    for value in values:
        if isinstance(value, bool):
            continue
        try:
            if value is not None:
                return float(value)
        except (TypeError, ValueError):
            pass
    return None


class LatestFrameCapture(threading.Thread):
    """Continuously captures only the most recent frame in a daemon thread."""

    def __init__(self, source: Union[str, int], stop_event: threading.Event) -> None:
        super().__init__(name="camera-capture", daemon=True)
        self.source = source
        self.stop_event = stop_event
        self.frames: queue.Queue[Any] = queue.Queue(maxsize=1)
        self._latest_frame: Any = None
        self._latest_debug_frame: Any = None
        self._frame_sequence = 0
        self._frame_condition = threading.Condition()

    def run(self) -> None:
        while not self.stop_event.is_set():
            capture: Optional[cv2.VideoCapture] = None
            try:
                # VideoCapture is deliberately isolated in this thread so an
                # unavailable ESP32-CAM can never block WebSocket telemetry.
                capture = cv2.VideoCapture(self.source)
                # This is essential for MJPEG streams: retain only the newest frame.
                capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                if not capture.isOpened():
                    LOG.warning("Cannot open camera source %r", self.source)
                else:
                    LOG.info("Camera source connected: %r", self.source)
                    while not self.stop_event.is_set():
                        ok, frame = capture.read()
                        if not ok or frame is None:
                            LOG.warning("Camera read failed")
                            break
                        self._put_latest(frame)
                        with self._frame_condition:
                            self._latest_frame = frame
                            self._frame_sequence += 1
                            self._frame_condition.notify_all()
            except cv2.error as exc:
                LOG.warning("OpenCV camera failure for %r: %s", self.source, exc)
            except Exception:
                LOG.exception("Unexpected camera failure for %r", self.source)
            finally:
                if capture is not None:
                    capture.release()

            if not self.stop_event.is_set():
                LOG.info("Camera reconnect scheduled in 5 seconds")
                self.stop_event.wait(5.0)

    def _put_latest(self, frame: Any) -> None:
        try:
            self.frames.put_nowait(frame)
        except queue.Full:
            with contextlib.suppress(queue.Empty):
                self.frames.get_nowait()
            with contextlib.suppress(queue.Full):
                self.frames.put_nowait(frame)

    def publish_debug_frame(self, frame: Any) -> None:
        """Expose the annotated inference frame through the local MJPEG server."""
        with self._frame_condition:
            self._latest_debug_frame = frame.copy()

    def jpeg_after(self, sequence: int, timeout: float = 1.0) -> tuple[int, Optional[bytes]]:
        """Wait for a newer frame and encode it for a local MJPEG dashboard client."""
        with self._frame_condition:
            if self._frame_sequence <= sequence:
                self._frame_condition.wait(timeout=timeout)
            if self._latest_frame is None or self._frame_sequence <= sequence:
                return sequence, None
            current_sequence = self._frame_sequence
            source = self._latest_debug_frame
            frame = (source if source is not None else self._latest_frame).copy()
        ok, encoded = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        return current_sequence, encoded.tobytes() if ok else None


class _MJPEGRequestHandler(BaseHTTPRequestHandler):
    """Minimal local-only MJPEG endpoint; configured by LocalMJPEGServer."""

    capture: LatestFrameCapture
    stop_event: threading.Event

    def do_GET(self) -> None:  # noqa: N802 - required BaseHTTPRequestHandler name
        if self.path.split("?", 1)[0] != "/stream.mjpg":
            self.send_error(404, "Use /stream.mjpg")
            return
        self.send_response(200)
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
        self.end_headers()
        sequence = 0
        try:
            while not self.stop_event.is_set():
                sequence, image = self.capture.jpeg_after(sequence)
                if image is None:
                    continue
                self.wfile.write(b"--frame\r\nContent-Type: image/jpeg\r\n")
                self.wfile.write(f"Content-Length: {len(image)}\r\n\r\n".encode("ascii"))
                self.wfile.write(image)
                self.wfile.write(b"\r\n")
        except (BrokenPipeError, ConnectionResetError):
            pass

    def log_message(self, format: str, *args: Any) -> None:
        LOG.debug("MJPEG client: " + format, *args)


class LocalMJPEGServer:
    """Serves the engine-owned camera so the browser never competes for it."""

    def __init__(self, capture: LatestFrameCapture, stop_event: threading.Event, host: str, port: int) -> None:
        handler = type("MJPEGRequestHandler", (_MJPEGRequestHandler,), {"capture": capture, "stop_event": stop_event})
        self._server = ThreadingHTTPServer((host, port), handler)
        self._server.daemon_threads = True
        self._thread = threading.Thread(target=self._server.serve_forever, name="mjpeg-server", daemon=True)
        self.url = f"http://{host}:{port}/stream.mjpg"

    def start(self) -> None:
        self._thread.start()
        LOG.info("Dashboard camera stream available at %s", self.url)

    def close(self) -> None:
        self._server.shutdown()
        self._server.server_close()
        self._thread.join(timeout=2.0)


class AlertQueue:
    """Bounded, newest-first alert buffer that survives WebSocket reconnects."""

    def __init__(self, maxsize: int = 100) -> None:
        self._queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=maxsize)

    def publish(self, alert: dict[str, Any]) -> None:
        if self._queue.full():
            with contextlib.suppress(asyncio.QueueEmpty):
                self._queue.get_nowait()
        with contextlib.suppress(asyncio.QueueFull):
            self._queue.put_nowait(alert)

    async def get(self) -> dict[str, Any]:
        return await self._queue.get()


async def receive_telemetry(websocket: Any, telemetry: LatestTelemetry, stop: asyncio.Event) -> None:
    """Single WebSocket reader; concurrent reads are prohibited by websockets."""
    while not stop.is_set():
        try:
            raw = await asyncio.wait_for(websocket.recv(), timeout=1.0)
        except asyncio.TimeoutError:
            continue
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8", errors="replace")
        try:
            message = json.loads(raw)
        except json.JSONDecodeError:
            LOG.warning("Ignoring non-JSON WebSocket message")
            continue
        if telemetry.update_from_message(message):
            LOG.debug("Telemetry updated")


async def send_alerts(websocket: Any, alerts: AlertQueue, stop: asyncio.Event) -> None:
    while not stop.is_set():
        try:
            alert = await asyncio.wait_for(alerts.get(), timeout=0.5)
        except asyncio.TimeoutError:
            continue
        try:
            await websocket.send(json.dumps({"event": "alert", "data": alert, "timestamp": utc_now()}))
            LOG.info("Alert sent: %s", alert["status"])
        except Exception:
            # Preserve a not-yet-delivered alert for the next connection.
            alerts.publish(alert)
            raise


async def websocket_supervisor(
    config: EngineConfig, telemetry: LatestTelemetry, alerts: AlertQueue, stop: asyncio.Event
) -> None:
    """Maintain the telemetry subscription with capped exponential backoff."""
    retry_delay = 1.0
    while not stop.is_set():
        try:
            LOG.info("Connecting to telemetry WebSocket: %s", config.websocket_url)
            async with websockets.connect(
                config.websocket_url, ping_interval=20, ping_timeout=20, close_timeout=5, max_queue=32
            ) as websocket:
                LOG.info("Telemetry WebSocket connected")
                retry_delay = 1.0
                receiver = asyncio.create_task(receive_telemetry(websocket, telemetry, stop))
                sender = asyncio.create_task(send_alerts(websocket, alerts, stop))
                done, pending = await asyncio.wait(
                    {receiver, sender}, return_when=asyncio.FIRST_COMPLETED
                )
                for task in pending:
                    task.cancel()
                for task in pending:
                    with contextlib.suppress(asyncio.CancelledError, Exception):
                        await task
                for task in done:
                    if not task.cancelled():
                        task.result()  # Propagate disconnects to the reconnect handler.
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            LOG.warning("Telemetry WebSocket unavailable (%s); retrying in %.1fs", exc, retry_delay)
            try:
                await asyncio.wait_for(stop.wait(), timeout=retry_delay)
            except asyncio.TimeoutError:
                retry_delay = min(retry_delay * 2, 30.0)


def extract_people(results: Any) -> list[dict[str, Any]]:
    """Strictly retain YOLO class 0 (person) detections."""
    people: list[dict[str, Any]] = []
    for result in results:
        boxes = getattr(result, "boxes", None)
        if boxes is None:
            continue
        for box in boxes:
            class_id = int(box.cls[0].item())
            if class_id != 0:
                continue
            x1, y1, x2, y2 = (round(float(value), 1) for value in box.xyxy[0].tolist())
            people.append(
                {
                    "class_id": 0,
                    "label": "person",
                    "confidence": round(float(box.conf[0].item()), 4),
                    "bbox_xyxy": [x1, y1, x2, y2],
                }
            )
    return people


def fusion_status(fusion: dict[str, Any]) -> str:
    """Classify a detected person using fresh, canonical sensor telemetry."""
    if not fusion["telemetry_fresh"]:
        return "UNVERIFIED"
    if fusion["temperature_critical"] or fusion["hazardous_gas"]:
        return "CRITICAL_SURVIVOR"
    if fusion["temperature_warning"]:
        return "WARNING"
    return "UNVERIFIED"


def build_alert(
    people: list[dict[str, Any]],
    telemetry: LatestTelemetry,
    config: EngineConfig,
    frame_width: int,
    frame_height: int,
    fusion: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    fusion = fusion if fusion is not None else telemetry.fusion_inputs(config)
    status = fusion_status(fusion)
    return {
        "type": "PERSON_DETECTION",
        "status": status,
        "person_detected": True,
        "person_count": len(people),
        "max_confidence": max(person["confidence"] for person in people),
        "detections": people,
        "frame_width": frame_width,
        "frame_height": frame_height,
        "sensor_fusion": fusion,
        "rover_id": fusion["rover_id"],
        "mission_id": fusion["mission_id"],
        "source": "ai_engine",
        "timestamp": utc_now(),
    }


def draw_debug_overlay(
    frame: Any, people: list[dict[str, Any]], fusion: dict[str, Any], status: str
) -> None:
    """Draw detection and live sensor-fusion state onto an OpenCV frame."""
    colors = {
        "CRITICAL_SURVIVOR": (0, 0, 255),
        "WARNING": (0, 191, 255),
        "UNVERIFIED": (0, 180, 255),
    }
    color = colors[status]
    for person in people:
        x1, y1, x2, y2 = (int(value) for value in person["bbox_xyxy"])
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(
            frame, f"person {person['confidence']:.2f}", (x1, max(25, y1 - 8)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2,
        )
    temperature = fusion["temperature_c"]
    temp_text = "TEMP: --" if temperature is None else f"TEMP: {temperature:.1f} C"
    gas_text = "GAS: HAZARDOUS" if fusion["hazardous_gas"] else f"GAS: {fusion['gas_status']}"
    telemetry_text = f"{temp_text} | {gas_text}"
    freshness = "LIVE" if fusion["telemetry_fresh"] else "STALE"
    cv2.rectangle(frame, (5, 5), (min(frame.shape[1] - 5, 650), 105), (0, 0, 0), -1)
    cv2.putText(frame, f"FUSION: {status}", (12, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    cv2.putText(frame, telemetry_text, (12, 56), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
    cv2.putText(frame, f"TELEMETRY: {freshness}", (12, 82), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (220, 220, 220), 1)


def draw_preview(frame: Any) -> bool:
    """Show the already-annotated debug frame when local preview is enabled."""
    cv2.imshow("A.R.M.O.R. AI Engine (press q to quit)", frame)
    return (cv2.waitKey(1) & 0xFF) == ord("q")


async def vision_loop(
    model: YOLO,
    capture: LatestFrameCapture,
    telemetry: LatestTelemetry,
    alerts: AlertQueue,
    config: EngineConfig,
    stop: asyncio.Event,
) -> None:
    last_alert_at: dict[str, float] = {}
    while not stop.is_set():
        try:
            frame = await asyncio.to_thread(capture.frames.get, True, 0.5)
        except queue.Empty:
            continue
        # YOLO inference runs in a worker thread. The asyncio event loop remains
        # available for receive_telemetry while inference is in progress.
        try:
            results = await asyncio.to_thread(
                model, frame, conf=config.confidence_threshold, classes=[0], verbose=False
            )
        except Exception:
            LOG.exception("YOLO inference failed; skipping frame")
            continue
        people = extract_people(results)
        fusion = telemetry.fusion_inputs(config)
        status = fusion_status(fusion) if people else "UNVERIFIED"
        draw_debug_overlay(frame, people, fusion, status)
        capture.publish_debug_frame(frame)
        if people:
            alert = build_alert(
                people, telemetry, config, frame.shape[1], frame.shape[0], fusion=fusion
            )
            now = time.monotonic()
            last_sent = last_alert_at.get(alert["status"], 0.0)
            if now - last_sent >= config.alert_cooldown_seconds:
                alerts.publish(alert)
                last_alert_at[alert["status"]] = now
                LOG.warning("%s (%d person(s))", alert["status"], len(people))
            if config.preview and draw_preview(frame):
                stop.set()
        elif config.preview and draw_preview(frame):
            stop.set()


async def run() -> None:
    config = EngineConfig.from_environment()
    if not config.websocket_url.startswith(("ws://", "wss://")):
        raise ValueError("WS_ENDPOINT must start with ws:// or wss://")
    if not 0.0 <= config.confidence_threshold <= 1.0:
        raise ValueError("YOLO_CONFIDENCE_THRESHOLD must be between 0 and 1")
    if config.temperature_critical_c <= config.temperature_warning_c:
        raise ValueError("TEMPERATURE_CRITICAL_C must be greater than TEMPERATURE_WARNING_C")
    if config.alert_cooldown_seconds < 0:
        raise ValueError("ALERT_COOLDOWN_SECONDS must be zero or greater")

    LOG.info("Loading YOLO model: %s", config.model_path)
    model = await asyncio.to_thread(YOLO, config.model_path)
    stop = asyncio.Event()
    capture_stop = threading.Event()
    capture = LatestFrameCapture(config.camera_source, capture_stop)
    telemetry = LatestTelemetry()
    alerts = AlertQueue()
    capture.start()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        with contextlib.suppress(NotImplementedError):
            loop.add_signal_handler(sig, stop.set)

    websocket_task = asyncio.create_task(websocket_supervisor(config, telemetry, alerts, stop))
    stream_server: Optional[LocalMJPEGServer] = None
    try:
        stream_server = LocalMJPEGServer(
            capture, capture_stop, config.stream_host, config.stream_port
        )
        stream_server.start()
        await vision_loop(model, capture, telemetry, alerts, config, stop)
    finally:
        stop.set()
        capture_stop.set()
        websocket_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await websocket_task
        if stream_server is not None:
            stream_server.close()
        capture.join(timeout=3.0)
        if config.preview:
            cv2.destroyAllWindows()


def main() -> None:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        LOG.info("Shutdown requested")
    except Exception:
        LOG.exception("AI engine stopped due to a fatal error")
        raise


if __name__ == "__main__":
    main()

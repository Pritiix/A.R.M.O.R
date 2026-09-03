"""
A.R.M.O.R. Simulator — Standalone Test Script
Run this to verify the simulation engine generates valid telemetry.

Usage:
  cd backend
  python -m simulator.test_simulator
"""
import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.services.simulation import SimulationEngine
from app.schemas.telemetry import SimulationScenario


def main():
    engine = SimulationEngine()
    scenarios = list(SimulationScenario)

    print("=" * 60)
    print("  A.R.M.O.R. Simulator — Validation Test")
    print("=" * 60)

    for scenario in scenarios:
        engine.set_scenario(scenario)
        packet = engine.tick()

        # Validate serialization
        packet_dict = packet.model_dump(mode="json")
        packet_json = packet.model_dump_json()

        # Re-parse to ensure valid JSON
        reparsed = json.loads(packet_json)

        assert reparsed["rover_id"] == "ARMOR-01", "rover_id mismatch"
        assert reparsed["sim_scenario"] == scenario.value, "scenario mismatch"
        assert isinstance(reparsed["sequence"], int), "sequence not int"

        print(f"  [OK] {scenario.value:<30} battery={packet_dict['rover']['battery']} "
              f"smoke_raw={packet_dict['sensors']['smoke_raw']} "
              f"connected={packet_dict['communication']['connected']}")

    print()
    print("  All scenarios validated successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()

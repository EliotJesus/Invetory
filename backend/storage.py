from datetime import datetime, timezone
from pathlib import Path
import json


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_FILE = PROJECT_ROOT / "data" / "devices.json"


class DeviceRepository:
    def __init__(self, data_file=DEFAULT_DATA_FILE):
        self.data_file = Path(data_file)
        self.devices = self._load()
        self.next_id = max((int(device.get("id", 0)) for device in self.devices), default=0) + 1

    def all(self):
        return self.devices

    def get(self, device_id):
        return next((device for device in self.devices if device["id"] == device_id), None)

    def create(self, payload):
        device = {
            "id": self.next_id,
            **payload,
            "fecha_registro": datetime.now(timezone.utc).isoformat(),
        }

        self.devices.append(device)
        self.next_id += 1
        self._save()

        return device

    def update(self, device_id, payload):
        device = self.get(device_id)

        if not device:
            return None

        device.update(payload)
        self._save()

        return device

    def delete(self, device_id):
        device = self.get(device_id)

        if not device:
            return False

        self.devices = [item for item in self.devices if item["id"] != device_id]
        self._save()

        return True

    def _load(self):
        if not self.data_file.exists():
            return []

        try:
            return json.loads(self.data_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return []

    def _save(self):
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        self.data_file.write_text(
            json.dumps(self.devices, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )


device_repository = DeviceRepository()

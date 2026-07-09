from flask import Blueprint, jsonify, request

from .storage import device_repository
from .validation import clean_device_payload, validate_device_payload


devices_bp = Blueprint("devices", __name__, url_prefix="/devices")


@devices_bp.route("", methods=["GET"])
def get_devices():
    return jsonify(device_repository.all())


@devices_bp.route("/<int:device_id>", methods=["GET"])
def get_device(device_id):
    device = device_repository.get(device_id)

    if not device:
        return jsonify({"error": "No encontrado"}), 404

    return jsonify(device)


@devices_bp.route("", methods=["POST"])
def create_device():
    data = request.get_json(silent=True)
    is_valid, message = validate_device_payload(data)

    if not is_valid:
        return jsonify({"error": message}), 400

    device = device_repository.create(clean_device_payload(data))

    return jsonify(device), 201


@devices_bp.route("/<int:device_id>", methods=["PUT"])
def update_device(device_id):
    data = request.get_json(silent=True)
    is_valid, message = validate_device_payload(data)

    if not is_valid:
        return jsonify({"error": message}), 400

    device = device_repository.update(device_id, clean_device_payload(data))

    if not device:
        return jsonify({"error": "No encontrado"}), 404

    return jsonify(device)


@devices_bp.route("/<int:device_id>", methods=["DELETE"])
def delete_device(device_id):
    deleted = device_repository.delete(device_id)

    if not deleted:
        return jsonify({"error": "No encontrado"}), 404

    return jsonify({"msg": "Eliminado"})

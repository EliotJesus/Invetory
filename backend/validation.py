REQUIRED_FIELDS = ["nombre", "tipo", "estado", "area"]


def validate_device_payload(data):
    if not isinstance(data, dict):
        return False, "El cuerpo de la solicitud debe ser JSON"

    for field in REQUIRED_FIELDS:
        if not str(data.get(field, "")).strip():
            return False, f"El campo '{field}' es obligatorio"

    return True, ""


def clean_device_payload(data):
    return {
        "nombre": str(data["nombre"]).strip(),
        "tipo": str(data["tipo"]).strip(),
        "estado": str(data["estado"]).strip(),
        "area": str(data["area"]).strip(),
    }

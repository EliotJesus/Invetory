export async function fetchDevices() {
    return apiRequest("/devices");
}

export async function createDevice(data) {
    return apiRequest("/devices", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function updateDevice(id, data) {
    return apiRequest(`/devices/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export async function deleteDevice(id) {
    return apiRequest(`/devices/${id}`, { method: "DELETE" });
}

async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error || "Error del servicio");
    }

    return payload;
}

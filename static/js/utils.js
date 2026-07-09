export function normalizeDevice(device) {
    return {
        id: device.id,
        nombre: device.nombre || "",
        tipo: device.tipo || "",
        estado: normalizeStatusValue(device.estado || ""),
        area: device.area || "",
        fecha_registro: device.fecha_registro || device.fecha || new Date().toISOString()
    };
}

export function normalizeStatusValue(status) {
    const value = String(status).toLowerCase();

    if (value.includes("repar")) return "En reparación";
    if (value.includes("baja") || value.includes("offline")) return "Baja";
    if (value.includes("activo") || value.includes("online")) return "Activo";

    return status || "";
}

export function statusBadge(status) {
    const normalized = normalizeStatusValue(status);

    if (normalized === "Activo") return { label: "En línea", className: "online" };
    if (normalized === "En reparación") return { label: "En reparación", className: "updating" };

    return { label: "Baja", className: "offline" };
}

export function typeIcon(type) {
    const normalized = String(type).toLowerCase();

    if (normalized.includes("cel")) return "smartphone";
    if (normalized.includes("impres")) return "printer";
    if (normalized.includes("monitor")) return "monitor";
    if (normalized.includes("servidor")) return "server";
    if (normalized.includes("pc")) return "cpu";

    return "laptop";
}

export function formatId(id) {
    const numeric = String(id).replace(/\D/g, "").slice(-4).padStart(4, "0");
    return `#DV-${numeric || "0000"}`;
}

export function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value || "Sin fecha";

    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

export function countBy(items, selector) {
    return items.reduce((acc, item) => {
        const key = selector(item) || "Sin asignar";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

export function csvCell(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

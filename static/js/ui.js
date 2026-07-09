import {
    countBy,
    csvCell,
    escapeHtml,
    formatDate,
    formatId,
    normalizeStatusValue,
    statusBadge,
    typeIcon
} from "./utils.js";

let toastTimeout = null;

export function cacheElements() {
    return {
        form: document.getElementById("deviceForm"),
        id: document.getElementById("id"),
        nombre: document.getElementById("nombre"),
        tipo: document.getElementById("tipo"),
        estado: document.getElementById("estado"),
        area: document.getElementById("area"),
        tabla: document.getElementById("tabla"),
        buscador: document.getElementById("buscador"),
        emptyState: document.getElementById("emptyState"),
        btnGuardar: document.getElementById("btnGuardar"),
        btnActualizar: document.getElementById("btnActualizar"),
        btnNuevoRegistro: document.getElementById("btnNuevoRegistro"),
        btnFiltro: document.getElementById("btnFiltro"),
        btnAplicarFiltros: document.getElementById("btnAplicarFiltros"),
        btnLimpiarFiltros: document.getElementById("btnLimpiarFiltros"),
        btnExportar: document.getElementById("btnExportar"),
        btnNotificaciones: document.getElementById("btnNotificaciones"),
        btnAyuda: document.getElementById("btnAyuda"),
        btnCerrarAyuda: document.getElementById("btnCerrarAyuda"),
        btnPerfil: document.getElementById("btnPerfil"),
        btnRecargarDatos: document.getElementById("btnRecargarDatos"),
        btnIrRegistro: document.getElementById("btnIrRegistro"),
        btnExportarJson: document.getElementById("btnExportarJson"),
        btnVistaCompacta: document.getElementById("btnVistaCompacta"),
        filtroEstado: document.getElementById("filtroEstado"),
        filtroTipo: document.getElementById("filtroTipo"),
        filtroArea: document.getElementById("filtroArea"),
        filterPanel: document.getElementById("filterPanel"),
        navItems: document.querySelectorAll(".nav-item[data-view]"),
        viewPanels: document.querySelectorAll(".view-section[data-view-panel]"),
        pageEyebrow: document.getElementById("pageEyebrow"),
        pageTitle: document.getElementById("pageTitle"),
        pageDescription: document.getElementById("pageDescription"),
        statusLabel: document.getElementById("statusLabel"),
        notificationPanel: document.getElementById("notificationPanel"),
        notificationSummary: document.getElementById("notificationSummary"),
        notificationList: document.getElementById("notificationList"),
        notificationDot: document.getElementById("notificationDot"),
        helpModal: document.getElementById("helpModal"),
        recentSummary: document.getElementById("recentSummary"),
        recentActivity: document.getElementById("recentActivity"),
        areaSummary: document.getElementById("areaSummary"),
        statusChart: document.getElementById("statusChart"),
        statusChartSummary: document.getElementById("statusChartSummary"),
        typeChart: document.getElementById("typeChart"),
        typeChartSummary: document.getElementById("typeChartSummary"),
        systemMode: document.getElementById("systemMode"),
        systemSummary: document.getElementById("systemSummary"),
        formMode: document.getElementById("formMode"),
        toast: document.getElementById("toast"),
        totalDispositivos: document.getElementById("totalDispositivos"),
        activos: document.getElementById("activos"),
        reparacion: document.getElementById("reparacion"),
        baja: document.getElementById("baja"),
        lastSync: document.getElementById("lastSync")
    };
}

export function getFormData(elements) {
    return {
        nombre: elements.nombre.value.trim(),
        tipo: elements.tipo.value.trim(),
        estado: elements.estado.value.trim(),
        area: elements.area.value.trim()
    };
}

export function validateDeviceForm(data) {
    if (!data.nombre) return "Ingresa el nombre del dispositivo.";
    if (!data.tipo) return "Selecciona una categoría.";
    if (!data.estado) return "Selecciona un estado.";
    if (!data.area) return "Selecciona un área.";
    return "";
}

export function getSelectedFilters(elements) {
    return {
        estado: elements.filtroEstado.value,
        tipo: elements.filtroTipo.value,
        area: elements.filtroArea.value
    };
}

export function clearSelectedFilters(elements) {
    elements.filtroEstado.value = "";
    elements.filtroTipo.value = "";
    elements.filtroArea.value = "";
}

export function renderInventory(elements, devices, handlers, filters = {}) {
    const query = elements.buscador.value.trim().toLowerCase();
    const rows = devices.filter((device) => {
        const haystack = [device.id, device.nombre, device.tipo, device.estado, device.area, device.fecha_registro]
            .join(" ")
            .toLowerCase();

        return haystack.includes(query) && matchesFilters(device, filters);
    });

    elements.tabla.innerHTML = rows.map(deviceRow).join("");
    elements.emptyState.classList.toggle("is-visible", rows.length === 0);
    updateStats(elements, devices);
    bindRowActions(elements, devices, handlers);

    return rows;
}

export function fillForm(elements, device) {
    elements.id.value = device.id;
    elements.nombre.value = device.nombre;
    elements.tipo.value = device.tipo;
    elements.estado.value = normalizeStatusValue(device.estado);
    elements.area.value = device.area;
    setEditMode(elements, true);
    document.querySelector(".register-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    elements.nombre.focus();
}

export function clearForm(elements) {
    elements.form.reset();
    elements.id.value = "";
    setEditMode(elements, false);
}

export function setEditMode(elements, isEditing) {
    elements.btnActualizar.disabled = !isEditing;
    elements.btnGuardar.disabled = isEditing;
    elements.formMode.textContent = isEditing ? "Editando dispositivo" : "Nuevo dispositivo";
}

export function showToast(elements, message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");

    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
        elements.toast.classList.remove("is-visible");
    }, 2800);
}

export function setSyncLabel(elements, label) {
    elements.lastSync.textContent = `${label} - ${new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
    })}`;
}

export function setFilterPanelVisible(elements, isVisible) {
    elements.filterPanel.hidden = !isVisible;
    elements.btnFiltro.setAttribute("aria-expanded", String(isVisible));
}

export function setNotificationPanelVisible(elements, isVisible) {
    elements.notificationPanel.hidden = !isVisible;
    elements.btnNotificaciones.setAttribute("aria-expanded", String(isVisible));
}

export function setHelpVisible(elements, isVisible) {
    elements.helpModal.hidden = !isVisible;
}

export function setActiveView(elements, viewName) {
    const content = {
        panel: {
            eyebrow: "Resumen operativo",
            title: "Panel de Control",
            description: "Consulta el estado general de la infraestructura registrada.",
            status: "Sistema sincronizado"
        },
        inventario: {
            eyebrow: "Infraestructura corporativa",
            title: "Gestión de Inventario",
            description: "Configure y registre nuevos terminales en la red de la empresa.",
            status: "Inventario activo"
        },
        analiticas: {
            eyebrow: "Lectura de datos",
            title: "Analíticas del Inventario",
            description: "Revise distribución por estado, categoría y área.",
            status: "Reportes actualizados"
        },
        sistema: {
            eyebrow: "Administración",
            title: "Sistema",
            description: "Gestione sincronización, exportaciones y preferencias de vista.",
            status: "Herramientas listas"
        }
    };

    const selected = content[viewName] || content.inventario;

    elements.navItems.forEach((item) => {
        item.classList.toggle("active", item.dataset.view === viewName);
    });
    elements.viewPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.viewPanel === viewName);
    });

    elements.pageEyebrow.textContent = selected.eyebrow;
    elements.pageTitle.textContent = selected.title;
    elements.pageDescription.textContent = selected.description;
    elements.statusLabel.textContent = selected.status;
}

export function renderSupportPanels(elements, devices, apiAvailable, filteredCount) {
    renderRecentActivity(elements, devices);
    renderAreaSummary(elements, devices);
    renderAnalytics(elements, devices);
    renderSystemSummary(elements, devices, apiAvailable, filteredCount);
    renderNotifications(elements, devices);
}

export function exportCsv(elements, devices) {
    if (!devices.length) {
        showToast(elements, "No hay registros para exportar.");
        return;
    }

    const header = ["ID", "Nombre", "Categoría", "Estado", "Área", "Fecha"];
    const body = devices.map((device) => [
        device.id,
        device.nombre,
        device.tipo,
        device.estado,
        device.area,
        formatDate(device.fecha_registro)
    ]);

    const csv = [header, ...body]
        .map((row) => row.map(csvCell).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventario-dispositivos.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast(elements, "CSV exportado.");
}

export function exportJson(elements, devices) {
    if (!devices.length) {
        showToast(elements, "No hay registros para exportar.");
        return;
    }

    const blob = new Blob([JSON.stringify(devices, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventario-dispositivos.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast(elements, "JSON exportado.");
}

function renderRecentActivity(elements, devices) {
    const recent = [...devices]
        .sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))
        .slice(0, 5);

    elements.recentSummary.textContent = recent.length
        ? `${recent.length} movimientos recientes`
        : "Sin movimientos";

    elements.recentActivity.innerHTML = recent.length
        ? recent.map((device) => `
            <li>
                <strong>${escapeHtml(device.nombre)}</strong>
                <span>${escapeHtml(device.tipo)} en ${escapeHtml(device.area)} · ${formatDate(device.fecha_registro)}</span>
            </li>
        `).join("")
        : `<li><strong>Sin actividad</strong><span>Registra un terminal para iniciar el historial.</span></li>`;
}

function renderAreaSummary(elements, devices) {
    const counts = countBy(devices, (device) => device.area);
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    elements.areaSummary.innerHTML = rows.length
        ? rows.map(([area, count]) => summaryRow(area, count)).join("")
        : summaryRow("Sin áreas registradas", 0);
}

function renderAnalytics(elements, devices) {
    const statusCounts = {
        "Activos": devices.filter((device) => normalizeStatusValue(device.estado) === "Activo").length,
        "En reparación": devices.filter((device) => normalizeStatusValue(device.estado) === "En reparación").length,
        "Dados de baja": devices.filter((device) => normalizeStatusValue(device.estado) === "Baja").length
    };
    const typeCounts = countBy(devices, (device) => device.tipo);

    elements.statusChartSummary.textContent = devices.length
        ? `${devices.length} equipos analizados`
        : "Sin datos";
    elements.typeChartSummary.textContent = Object.keys(typeCounts).length
        ? `${Object.keys(typeCounts).length} categorías`
        : "Sin datos";

    elements.statusChart.innerHTML = chartRows(statusCounts, devices.length);
    elements.typeChart.innerHTML = chartRows(typeCounts, devices.length);
}

function renderSystemSummary(elements, devices, apiAvailable, filteredCount) {
    elements.systemMode.textContent = apiAvailable ? "Conectado al servicio Flask" : "Modo local activo";
    elements.systemSummary.innerHTML = [
        summaryRow("Fuente de datos", apiAvailable ? "Servicio Flask" : "Almacenamiento local"),
        summaryRow("Registros totales", devices.length),
        summaryRow("Registros visibles", filteredCount),
        summaryRow("Última revisión", new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }))
    ].join("");
}

function renderNotifications(elements, devices) {
    const repairs = devices.filter((device) => normalizeStatusValue(device.estado) === "En reparación").length;
    const inactive = devices.filter((device) => normalizeStatusValue(device.estado) === "Baja").length;
    const notifications = [];

    if (!devices.length) {
        notifications.push(["Inventario vacío", "Agrega el primer dispositivo para iniciar el control."]);
    }
    if (repairs) {
        notifications.push(["Equipos en reparación", `${repairs} terminales requieren seguimiento.`]);
    }
    if (inactive) {
        notifications.push(["Equipos dados de baja", `${inactive} registros están marcados como baja.`]);
    }
    if (!notifications.length) {
        notifications.push(["Todo en orden", "No hay alertas pendientes en el inventario."]);
    }

    elements.notificationSummary.textContent = `${notifications.length} aviso(s)`;
    elements.notificationDot.style.display = notifications.some(([title]) => title !== "Todo en orden") ? "" : "none";
    elements.notificationList.innerHTML = notifications.map(([title, text]) => `
        <li>
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(text)}</span>
        </li>
    `).join("");
}

function deviceRow(device) {
    const badge = statusBadge(device.estado);
    const icon = typeIcon(device.tipo);

    return `
        <tr>
            <td><span class="device-id">${formatId(device.id)}</span></td>
            <td>
                <div class="device-name">
                    <i data-lucide="${icon}"></i>
                    <span>${escapeHtml(device.nombre)}</span>
                </div>
            </td>
            <td>${escapeHtml(device.tipo)}</td>
            <td><span class="badge ${badge.className}">${badge.label}</span></td>
            <td>${escapeHtml(device.area)}</td>
            <td>${formatDate(device.fecha_registro)}</td>
            <td>
                <div class="row-actions">
                    <button class="action-button btn-editar" type="button" data-id="${device.id}" aria-label="Editar">
                        <i data-lucide="square-pen"></i>
                    </button>
                    <button class="action-button btn-eliminar" type="button" data-id="${device.id}" aria-label="Eliminar">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function matchesFilters(device, filters) {
    const status = normalizeStatusValue(device.estado);

    if (filters.estado && status !== normalizeStatusValue(filters.estado)) return false;
    if (filters.tipo && normalizeText(device.tipo) !== normalizeText(filters.tipo)) return false;
    if (filters.area && normalizeText(device.area) !== normalizeText(filters.area)) return false;

    return true;
}

function bindRowActions(elements, devices, handlers) {
    elements.tabla.querySelectorAll(".btn-editar").forEach((button) => {
        button.addEventListener("click", () => {
            const device = devices.find((item) => String(item.id) === String(button.dataset.id));
            if (device) handlers.onEdit(device);
        });
    });

    elements.tabla.querySelectorAll(".btn-eliminar").forEach((button) => {
        button.addEventListener("click", () => handlers.onRemove(button.dataset.id));
    });
}

function updateStats(elements, devices) {
    const counts = devices.reduce((acc, device) => {
        const status = normalizeStatusValue(device.estado);

        if (status === "Activo") acc.activos += 1;
        if (status === "En reparación") acc.reparacion += 1;
        if (status === "Baja") acc.baja += 1;

        return acc;
    }, { activos: 0, reparacion: 0, baja: 0 });

    elements.totalDispositivos.textContent = devices.length;
    elements.activos.textContent = counts.activos;
    elements.reparacion.textContent = counts.reparacion;
    elements.baja.textContent = counts.baja;
}

function summaryRow(label, value) {
    return `
        <div class="summary-row">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        </div>
    `;
}

function chartRows(counts, total) {
    const entries = Object.entries(counts).filter(([, count]) => count > 0);

    if (!entries.length) {
        return `<div class="chart-row"><strong>Sin registros</strong><span>Aún no hay datos para graficar.</span></div>`;
    }

    return entries
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => {
            const percent = total ? Math.round((count / total) * 100) : 0;

            return `
                <div class="chart-row">
                    <div class="chart-heading">
                        <span>${escapeHtml(label)}</span>
                        <strong>${count} (${percent}%)</strong>
                    </div>
                    <div class="chart-track">
                        <div class="chart-fill" style="--size: ${percent}%"></div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function normalizeText(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

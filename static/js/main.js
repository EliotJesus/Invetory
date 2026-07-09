import { createDevice, deleteDevice, fetchDevices, updateDevice } from "./api.js";
import { initialApiAvailable } from "./settings.js";
import { readLocalDevices, saveLocalDevices } from "./local-storage.js";
import { normalizeDevice } from "./utils.js";
import {
    cacheElements,
    clearSelectedFilters,
    clearForm,
    exportCsv,
    exportJson,
    fillForm,
    getFormData,
    getSelectedFilters,
    renderInventory,
    renderSupportPanels,
    setActiveView,
    setFilterPanelVisible,
    setHelpVisible,
    setNotificationPanelVisible,
    setSyncLabel,
    showToast,
    validateDeviceForm
} from "./ui.js";

let devices = [];
let visibleDevices = [];
let apiAvailable = initialApiAvailable;
let elements = null;

document.addEventListener("DOMContentLoaded", () => {
    elements = cacheElements();
    bindEvents();
    loadData();
});

function bindEvents() {
    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();
        create();
    });

    elements.btnActualizar.addEventListener("click", update);
    elements.buscador.addEventListener("input", render);
    elements.btnNuevoRegistro.addEventListener("click", () => {
        changeView("inventario");
        clearForm(elements);
        elements.nombre.focus();
        document.querySelector(".register-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.btnExportar.addEventListener("click", () => exportCsv(elements, visibleDevices));
    elements.btnFiltro.addEventListener("click", () => {
        setFilterPanelVisible(elements, elements.filterPanel.hidden);
    });
    elements.btnAplicarFiltros.addEventListener("click", () => {
        render();
        showToast(elements, "Filtros aplicados.");
    });
    elements.btnLimpiarFiltros.addEventListener("click", () => {
        clearSelectedFilters(elements);
        elements.buscador.value = "";
        render();
        showToast(elements, "Filtros limpiados.");
    });
    elements.btnNotificaciones.addEventListener("click", () => {
        setNotificationPanelVisible(elements, elements.notificationPanel.hidden);
    });
    elements.btnAyuda.addEventListener("click", () => setHelpVisible(elements, true));
    elements.btnCerrarAyuda.addEventListener("click", () => setHelpVisible(elements, false));
    elements.helpModal.addEventListener("click", (event) => {
        if (event.target === elements.helpModal) setHelpVisible(elements, false);
    });
    elements.btnPerfil.addEventListener("click", () => {
        changeView("sistema");
        showToast(elements, "Perfil administrativo abierto.");
    });
    elements.btnRecargarDatos.addEventListener("click", async () => {
        await loadData();
        showToast(elements, "Datos recargados.");
    });
    elements.btnIrRegistro.addEventListener("click", () => {
        changeView("inventario");
        document.querySelector(".register-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.btnExportarJson.addEventListener("click", () => exportJson(elements, devices));
    elements.btnVistaCompacta.addEventListener("click", () => {
        document.body.classList.toggle("compact-table");
        const compact = document.body.classList.contains("compact-table");
        elements.btnVistaCompacta.textContent = compact ? "Vista normal" : "Vista compacta";
        showToast(elements, compact ? "Vista compacta activada." : "Vista normal activada.");
    });
    elements.navItems.forEach((item) => {
        item.addEventListener("click", () => changeView(item.dataset.view));
    });
}

async function loadData() {
    if (apiAvailable) {
        try {
            const data = await fetchDevices();
            devices = data.map(normalizeDevice);
            saveLocalDevices(devices);
            render();
            setSyncLabel(elements, "Sincronizado con el servicio");
            return;
        } catch (error) {
            apiAvailable = false;
            showToast(elements, "Servicio no disponible. Usando almacenamiento local.");
        }
    }

    devices = readLocalDevices();
    render();
    setSyncLabel(elements, "Modo local activo");
}

async function create() {
    const data = getFormData(elements);
    const error = validateDeviceForm(data);

    if (error) {
        showToast(elements, error);
        return;
    }

    if (apiAvailable) {
        try {
            const created = await createDevice(data);
            devices.push(normalizeDevice(created));
        } catch (error) {
            showToast(elements, "No se pudo guardar en el servicio.");
            return;
        }
    } else {
        devices.push({
            id: Date.now(),
            ...data,
            fecha_registro: new Date().toISOString()
        });
    }

    saveLocalDevices(devices);
    render();
    clearForm(elements);
    showToast(elements, "Registro guardado correctamente.");
}

async function update() {
    const id = elements.id.value;

    if (!id) {
        showToast(elements, "Selecciona un registro para actualizar.");
        return;
    }

    const data = getFormData(elements);
    const error = validateDeviceForm(data);

    if (error) {
        showToast(elements, error);
        return;
    }

    if (apiAvailable) {
        try {
            const updated = await updateDevice(id, data);
            devices = devices.map((device) => String(device.id) === String(id) ? normalizeDevice(updated) : device);
        } catch (error) {
            showToast(elements, "No se pudo actualizar en el servicio.");
            return;
        }
    } else {
        devices = devices.map((device) => {
            if (String(device.id) !== String(id)) return device;
            return { ...device, ...data };
        });
    }

    saveLocalDevices(devices);
    render();
    clearForm(elements);
    showToast(elements, "Registro actualizado.");
}

async function remove(id) {
    const device = devices.find((item) => String(item.id) === String(id));
    const name = device ? device.nombre : "este registro";

    if (!window.confirm(`Eliminar ${name}?`)) return;

    if (apiAvailable) {
        try {
            await deleteDevice(id);
        } catch (error) {
            showToast(elements, "No se pudo eliminar en el servicio.");
            return;
        }
    }

    devices = devices.filter((item) => String(item.id) !== String(id));
    saveLocalDevices(devices);
    render();
    clearForm(elements);
    showToast(elements, "Registro eliminado.");
}

function edit(device) {
    changeView("inventario");
    fillForm(elements, device);
}

function render() {
    visibleDevices = renderInventory(elements, devices, {
        onEdit: edit,
        onRemove: remove
    }, getSelectedFilters(elements));
    renderSupportPanels(elements, devices, apiAvailable, visibleDevices.length);
}

function changeView(viewName) {
    setActiveView(elements, viewName);
    setNotificationPanelVisible(elements, false);
    render();
}

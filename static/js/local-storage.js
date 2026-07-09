import { STORAGE_KEY } from "./settings.js";
import { normalizeDevice } from "./utils.js";

export function readLocalDevices() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").map(normalizeDevice);
    } catch (error) {
        return [];
    }
}

export function saveLocalDevices(devices) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
}

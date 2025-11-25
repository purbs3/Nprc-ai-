// src/api/settings.ts
import type { AppSettings } from '../types';

const SETTINGS_KEY = 'nprc-app-settings';
const ADMIN_PASSWORD_KEY = 'nprc-admin-password';

const getInitialSettings = (): AppSettings => ({
    appName: 'NPRC Physio',
    contactEmail: 'contact@nprcphysio.com',
    whatsappNumber: '+919876543210',
});

export const getSettings = async (): Promise<AppSettings> => {
    console.log("Fetching settings...");
    try {
        // ✅ Uncomment once backend ready:
        // const res = await fetch('http://localhost:3001/api/settings');
        // if (!res.ok) throw new Error('Failed to fetch settings');
        // return await res.json();

        const json = localStorage.getItem(SETTINGS_KEY);
        if (json) return JSON.parse(json);
    } catch (e) {
        console.error("Settings load error:", e);
    }
    const defaults = getInitialSettings();
    await saveSettings(defaults);
    return defaults;
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
    console.log("Saving settings...");
    try {
        // ✅ Uncomment once backend ready:
        // await fetch('http://localhost:3001/api/settings', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(settings)
        // });
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Settings save error:", e);
    }
};

export const getAdminPassword = async (): Promise<string> => {
    console.log("Fetching admin password...");
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (stored) return stored;
    const def = 'admin';
    await saveAdminPassword(def);
    return def;
};

export const saveAdminPassword = async (password: string): Promise<void> => {
    console.log("Saving admin password...");
    localStorage.setItem(ADMIN_PASSWORD_KEY, password);
};

export const checkDbConnection = async (): Promise<{ status: string; message: string }> => {
    try {
        const response = await fetch('http://localhost:3001/api/status/db');
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Server error: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error("DB check failed:", e);
        throw new Error("Unable to connect to backend. Check if API server is running.");
    }
};

import type { Clinician } from '../types';
import { getAuthHeader } from './authService';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * =================================================================================
 * GET /api/clinicians
 * =================================================================================
 */
export const getClinicians = async (): Promise<Clinician[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/clinicians`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch clinicians: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("getClinicians failed:", error);
        return [];
    }
};

/**
 * =================================================================================
 * GET /api/clinicians/{id}
 * =================================================================================
 */
export const getClinicianById = async (id: string): Promise<Clinician | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/clinicians/${id}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', ...getAuthHeader() },
        });

        if (!response.ok) {
            throw new Error(`Clinician not found: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("getClinicianById failed:", error);
        return null;
    }
};

/**
 * =================================================================================
 * POST /api/clinicians
 * =================================================================================
 */
export const addClinician = async (clinicianData: Omit<Clinician, 'id'>): Promise<Clinician> => {
    try {
        const response = await fetch(`${API_BASE_URL}/clinicians`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(clinicianData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create clinician: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("addClinician failed:", error);
        throw error;
    }
};

/**
 * =================================================================================
 * PUT /api/clinicians/{id}
 * =================================================================================
 */
export const updateClinician = async (id: string, updates: Partial<Clinician>): Promise<Clinician | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/clinicians/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error(`Failed to update clinician: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("updateClinician failed:", error);
        return null;
    }
};

/**
 * =================================================================================
 * DELETE /api/clinicians/{id}
 * =================================================================================
 */
export const deleteClinician = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/clinicians/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });

        return response.ok;
    } catch (error) {
        console.error("deleteClinician failed:", error);
        return false;
    }
};

import type { User, LoginRequest, LoginResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api'; // match ASP.NET backend port

/**
 * =================================================================================
 * GET /api/users
 * =================================================================================
 */
export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("getUsers failed:", error);
        return [];
    }
};

/**
 * =================================================================================
 * POST /api/users
 * =================================================================================
 */
export const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create user: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("addUser failed:", error);
        throw error;
    }
};

/**
 * =================================================================================
 * PUT /api/users/{id}
 * =================================================================================
 */
export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error(`Failed to update user: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("updateUser failed:", error);
        return null;
    }
};

/**
 * =================================================================================
 * DELETE /api/users/{id}
 * =================================================================================
 */
export const deleteUser = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        return response.ok;
    } catch (error) {
        console.error("deleteUser failed:", error);
        return false;
    }
};

/**
 * =================================================================================
 * POST /api/auth/login
 * Compatible with ASP.NET JWT Authentication.
 * =================================================================================
 */
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            console.warn("Login failed with status:", response.status);
            return null;
        }

        const data = await response.json();

        // Store JWT Token locally
        if (data.token) {
            localStorage.setItem('jwtToken', data.token);
        }

        return data;
    } catch (error) {
        console.error("loginUser failed:", error);
        return null;
    }
};

/**
 * =================================================================================
 * Helper: Get Authorization Header
 * =================================================================================
 */
export const getAuthHeader = (): HeadersInit => {
    const token = localStorage.getItem('jwtToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

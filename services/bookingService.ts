import type { Booking } from '../types';

// The base URL for your backend API. In a real production app,
// this would come from an environment variable.
const API_BASE_URL = 'http://localhost:3001';

/**
 * =================================================================================
 * API Call: GET /api/bookings
 * Fetches all bookings from the live database via the backend server.
 * =================================================================================
 */
export const getBookings = async (): Promise<Booking[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookings = await response.json();
        return bookings;
    } catch (error) {
        console.error("Failed to fetch bookings from API:", error);
        // Return an empty array on failure to prevent the app from crashing.
        return [];
    }
};

/**
 * =================================================================================
 * API Call: POST /api/bookings
 * Persists changes for ALL bookings.
 * NOTE: A real-world app would have more granular PUT/PATCH/DELETE endpoints.
 * This function simulates a "save all" for simplicity based on the existing pattern.
 * =================================================================================
 */
export const saveBookings = async (bookings: Booking[]): Promise<void> => {
    // This function is kept for components that use a "save all" pattern, like status updates.
    // In a real app, this would be replaced by individual PUT requests for each change.
    // For now, it doesn't do anything as individual changes are handled by addBooking etc.
    console.log("Simulating bulk save; in a real app, use individual updates.");
    await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * =================================================================================
 * API Call: POST /api/bookings
 * Creates a single new booking in the database.
 * =================================================================================
 */
export const addBooking = async (newBookingData: Omit<Booking, 'id'>): Promise<Booking> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBookingData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        const newBooking: Booking = {
            ...newBookingData,
            id: result.id, // Get the new ID from the backend response
        };
        return newBooking;
    } catch (error) {
        console.error("Failed to add booking via API:", error);
        // Re-throw the error so the component can handle it (e.g., show an alert)
        throw error;
    }
};

import type { Workshop } from '../types';

const WORKSHOPS_KEY = 'nprc-workshops';

// --- DUMMY DATA (for localStorage simulation) ---
const getInitialWorkshops = (): Workshop[] => [
    {
        id: '1',
        title: 'Mastering Your Mobility: A Deep Dive into Joint Health',
        description: 'Learn key exercises and lifestyle changes to improve joint mobility and reduce pain. Perfect for all ages.',
        date: '2024-09-15',
        time: '18:00',
        instructor: 'Dr. Purab Sinha',
        registrationLink: '#contact',
    },
    {
        id: '2',
        title: "Desk Worker's Guide to a Pain-Free Back",
        description: 'Combat the negative effects of prolonged sitting with our expert-led workshop on posture, ergonomics, and simple desk exercises.',
        date: '2024-09-22',
        time: '19:00',
        instructor: 'Dr. Tarique Akhtar',
        registrationLink: '#contact',
    }
];

// --- BACKEND BLUEPRINT ---
// This file simulates fetching and saving workshop data.
// In a real application, these functions would make API calls to your backend server.

/**
 * =================================================================================
 * BACKEND API ENDPOINT: GET /api/workshops
 * =================================================================================
 * This endpoint should fetch all workshops from the database.
 *
 * MariaDB SQL Query Example:
 * SELECT * FROM workshops ORDER BY date ASC, time ASC;
 *
 * The server should return the workshops as a JSON array.
 * =================================================================================
 */
export const getWorkshops = async (): Promise<Workshop[]> => {
    // CURRENT: Simulating fetch from localStorage.
    // FUTURE: return await (await fetch('/api/workshops')).json();
    console.log("Simulating API call: getWorkshops");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        const workshopsJson = localStorage.getItem(WORKSHOPS_KEY);
        if (workshopsJson) {
            const workshops = JSON.parse(workshopsJson);
            if (Array.isArray(workshops) && workshops.length > 0) {
                return workshops;
            }
        }
    } catch (error) {
        console.error("Failed to load workshops from localStorage:", error);
    }
    const initialData = getInitialWorkshops();
    await saveWorkshops(initialData);
    return initialData;
};

/**
 * =================================================================================
 * BACKEND API ENDPOINT: POST /api/workshops
 * (Or more granular endpoints for CREATE, UPDATE, DELETE)
 * =================================================================================
 * This endpoint should persist changes to workshops.
 *
 * MariaDB SQL Query Example (for creating a workshop):
 * INSERT INTO workshops (id, title, description, date, time, instructor, registrationLink)
 * VALUES (?, ?, ?, ?, ?, ?, ?);
 * =================================================================================
 */
export const saveWorkshops = async (workshops: Workshop[]): Promise<void> => {
    // CURRENT: Simulating save to localStorage.
    // FUTURE: This logic will move into components, making individual API calls.
    console.log("Simulating API call: saveWorkshops");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(workshops));
    } catch (error) {
        console.error("Failed to save workshops to localStorage:", error);
    }
};

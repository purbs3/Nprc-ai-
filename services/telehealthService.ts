import type { TelehealthSession } from '../types';

const TELEHEALTH_SESSIONS_KEY = 'nprc-telehealth-sessions';

// Helper to get initial dummy data if local storage is empty
const getInitialSessions = (): TelehealthSession[] => [
    {
        id: '1',
        patientName: 'John Doe',
        date: '2024-08-15',
        time: '10:00',
        status: 'Scheduled',
        clinicianId: 'c1', // Dr. Purab
        notes: 'Initial consultation for lower back pain.'
    },
    {
        id: '2',
        patientName: 'Jane Smith',
        date: '2024-08-12',
        time: '14:30',
        status: 'Completed',
        clinicianId: 'c1', // Dr. Purab
        notes: 'Follow-up for shoulder rehabilitation. Patient shows good progress.'
    },
    {
        id: '3',
        patientName: 'Peter Jones',
        date: '2024-08-10',
        time: '11:00',
        status: 'Cancelled',
        clinicianId: 'c2', // Dr. Tarique
        notes: 'Patient cancelled due to a personal emergency.'
    },
    {
        id: '4',
        patientName: 'Mary Poppins',
        date: '2024-09-01',
        time: '09:00',
        status: 'Scheduled',
        clinicianId: 'c2', // Dr. Tarique
        notes: 'Ankle sprain follow-up.'
    },
];

// --- BACKEND BLUEPRINT ---
// This file simulates fetching and saving telehealth sessions.
// In a real application, these functions would make API calls to your backend server.

/**
 * =================================================================================
 * BACKEND API ENDPOINT: GET /api/telehealth-sessions
 * =================================================================================
 * This endpoint should fetch all telehealth sessions.
 *
 * MariaDB SQL Query Example:
 * SELECT * FROM telehealth_sessions ORDER BY date DESC, time DESC;
 *
 * The server should return the sessions as a JSON array.
 * =================================================================================
 */
export const getTelehealthSessions = async (): Promise<TelehealthSession[]> => {
    // CURRENT: Simulating fetch from localStorage.
    // FUTURE: return await (await fetch('/api/telehealth-sessions')).json();
    console.log("Simulating API call: getTelehealthSessions");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        const sessionsJson = localStorage.getItem(TELEHEALTH_SESSIONS_KEY);
        if (sessionsJson) {
            const sessions = JSON.parse(sessionsJson);
            if (Array.isArray(sessions) && sessions.length > 0) {
                return sessions;
            }
        }
    } catch (error) {
        console.error("Failed to load telehealth sessions from localStorage:", error);
    }
    const initialData = getInitialSessions();
    await saveTelehealthSessions(initialData);
    return initialData;
};

/**
 * =================================================================================
 * BACKEND API ENDPOINT: POST /api/telehealth-sessions (for saving all)
 * More realistically:
 * POST /api/telehealth-sessions (Create one)
 * PUT /api/telehealth-sessions/:id (Update one)
 * DELETE /api/telehealth-sessions/:id (Delete one)
 * =================================================================================
 * This endpoint should persist changes to telehealth sessions.
 *
 * MariaDB SQL Query Example (for updating a session):
 * UPDATE telehealth_sessions
 * SET patientName = ?, date = ?, time = ?, status = ?, notes = ?
 * WHERE id = ?;
 * =================================================================================
 */
export const saveTelehealthSessions = async (sessions: TelehealthSession[]): Promise<void> => {
    // CURRENT: Simulating save to localStorage.
    // FUTURE: This logic will move into components, making individual API calls.
    console.log("Simulating API call: saveTelehealthSessions");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        localStorage.setItem(TELEHEALTH_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error("Failed to save telehealth sessions to localStorage:", error);
    }
};
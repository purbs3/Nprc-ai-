import type { TreatmentPlan } from '../types';

const TREATMENT_PLANS_KEY = 'nprc-treatment-plans';

const getInitialPlans = (): TreatmentPlan[] => [
    {
        id: 'tp1',
        patientName: 'John Doe',
        condition: 'Lower Back Pain',
        goals: 'Reduce pain by 50% in 2 weeks, improve flexibility.',
        exercises: [
            { name: 'Cat-Cow Stretch', sets: 2, reps: 10, frequency: 'Daily' },
            { name: 'Pelvic Tilts', sets: 3, reps: 15, frequency: 'Daily' },
        ]
    },
    {
        id: 'tp2',
        patientName: 'Jane Smith',
        condition: 'Rotator Cuff Strain',
        goals: 'Regain full range of motion in 4 weeks.',
        exercises: [
            { name: 'Pendulum Swings', sets: 2, reps: 20, frequency: 'Twice Daily' },
            { name: 'Wall Push-ups', sets: 3, reps: 10, frequency: '3 times a week' },
        ]
    },
];

// --- BACKEND BLUEPRINT ---
// This file simulates fetching and saving treatment plans.
// In a real application, these functions would make API calls to your backend server.

/**
 * =================================================================================
 * BACKEND API ENDPOINT: GET /api/treatment-plans
 * =================================================================================
 * This endpoint should fetch all treatment plans. The `exercises` could be a
 * JSON column in MariaDB or a separate related table.
 *
 * MariaDB SQL Query Example (with JSON column):
 * SELECT * FROM treatment_plans;
 *
 * The server should return the plans as a JSON array.
 * =================================================================================
 */
export const getTreatmentPlans = async (): Promise<TreatmentPlan[]> => {
    // CURRENT: Simulating fetch from localStorage.
    // FUTURE: return await (await fetch('/api/treatment-plans')).json();
    console.log("Simulating API call: getTreatmentPlans");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        const plansJson = localStorage.getItem(TREATMENT_PLANS_KEY);
        if (plansJson) {
            const plans = JSON.parse(plansJson);
            if (Array.isArray(plans) && plans.length > 0) {
                return plans;
            }
        }
    } catch (error) {
        console.error("Failed to load treatment plans from localStorage:", error);
    }
    const initialData = getInitialPlans();
    await saveTreatmentPlans(initialData);
    return initialData;
};

/**
 * =================================================================================
 * BACKEND API ENDPOINT: POST /api/treatment-plans
 * (Or more granular endpoints for CREATE, UPDATE, DELETE)
 * =================================================================================
 * This endpoint should persist changes to treatment plans.
 *
 * MariaDB SQL Query Example (for creating a plan with a JSON column for exercises):
 * INSERT INTO treatment_plans (id, patientName, condition, goals, exercises)
 * VALUES (?, ?, ?, ?, ?);
 * The 'exercises' value would be a JSON string.
 * =================================================================================
 */
export const saveTreatmentPlans = async (plans: TreatmentPlan[]): Promise<void> => {
    // CURRENT: Simulating save to localStorage.
    // FUTURE: This logic will move into components, making individual API calls.
    console.log("Simulating API call: saveTreatmentPlans");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        localStorage.setItem(TREATMENT_PLANS_KEY, JSON.stringify(plans));
    } catch (error) {
        console.error("Failed to save treatment plans to localStorage:", error);
    }
};

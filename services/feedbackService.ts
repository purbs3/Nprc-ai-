// src/api/feedback.ts
import type { Feedback } from '../types';

const FEEDBACK_KEY = 'nprc-feedback';

/**
 * =================================================================================
 * BACKEND API ENDPOINT: GET /api/feedback
 * =================================================================================
 */
export const getFeedback = async (): Promise<Feedback[]> => {
    console.log("Fetching feedback data...");

    try {
        // ✅ Uncomment below line once backend ready:
        // const res = await fetch('http://localhost:3001/api/feedback');
        // if (!res.ok) throw new Error('Failed to fetch feedback');
        // return await res.json();

        // Simulated localStorage fallback
        const feedbackJson = localStorage.getItem(FEEDBACK_KEY);
        if (feedbackJson) {
            const feedback = JSON.parse(feedbackJson);
            if (Array.isArray(feedback)) return feedback;
        }
    } catch (error) {
        console.error("Failed to load feedback:", error);
    }
    return [];
};

/**
 * =================================================================================
 * BACKEND API ENDPOINT: POST /api/feedback
 * =================================================================================
 */
export const addFeedback = async (newFeedback: Omit<Feedback, 'id' | 'submittedAt'>): Promise<void> => {
    console.log("Submitting feedback...");

    try {
        // ✅ Uncomment once backend is ready:
        // await fetch('http://localhost:3001/api/feedback', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(newFeedback)
        // });

        // Local fallback
        const allFeedback = await getFeedback();
        const feedbackToAdd: Feedback = {
            ...newFeedback,
            id: Date.now().toString(),
            submittedAt: new Date().toISOString(),
        };
        const updated = [feedbackToAdd, ...allFeedback];
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error("Failed to submit feedback:", error);
    }
};

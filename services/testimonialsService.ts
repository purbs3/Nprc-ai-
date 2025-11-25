import type { Testimonial } from '../types';
import { TESTIMONIALS as INITIAL_TESTIMONIALS } from '../constants';

const TESTIMONIALS_KEY = 'nprc-testimonials';


export const getTestimonials = async (): Promise<Testimonial[]> => {
    console.log("Simulating API call: getTestimonials");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        const testimonialsJson = localStorage.getItem(TESTIMONIALS_KEY);
        if (testimonialsJson) {
            const testimonials = JSON.parse(testimonialsJson);
            if (Array.isArray(testimonials) && testimonials.length > 0) {
                return testimonials;
            }
        }
    } catch (error) {
        console.error("Failed to load testimonials from localStorage:", error);
    }

    // If nothing in localStorage, save and return the initial data from constants
    await saveTestimonials(INITIAL_TESTIMONIALS);
    return INITIAL_TESTIMONIALS;
};


export const saveTestimonials = async (testimonials: Testimonial[]): Promise<void> => {
    console.log("Simulating API call: saveTestimonials");
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(testimonials));
    } catch (error) {
        console.error("Failed to save testimonials to localStorage:", error);
    }
};
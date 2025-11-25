import React, { useState, useEffect } from 'react';
import { getTestimonials } from '../services/testimonialsService';
import type { Testimonial } from '../types';

const TestimonialsSection: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        const loadTestimonials = async () => {
            const fetchedTestimonials = await getTestimonials();
            setTestimonials(fetchedTestimonials);
        };
        loadTestimonials();
    }, []);

    return (
        <section id="testimonials" className="py-24 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Patients and Professionals</h2>
                    <p className="text-slate-300 text-lg">
                        See what our users are saying about their experience with our AI assistant.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 flex flex-col">
                            <p className="text-slate-300 flex-grow mb-6">"{testimonial.quote}"</p>
                            <div className="flex items-center">
                                <img src={testimonial.imageUrl} alt={testimonial.author} className="h-12 w-12 rounded-full object-cover mr-4" />
                                <div>
                                    <p className="font-bold text-white">{testimonial.author}</p>
                                    <p className="text-sm text-cyan-400">{testimonial.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
import React, { useState, useEffect } from 'react';
import { getTherapists } from '../services/therapistService';
import type { Therapist } from '../types';
import { WhatsAppIcon } from './IconComponents';

interface TherapistsSectionProps {
    onBookNow: (therapist: Therapist) => void;
}

const TherapistsSection: React.FC<TherapistsSectionProps> = ({ onBookNow }) => {
    const [therapists, setTherapists] = useState<Therapist[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const fetchedTherapists = await getTherapists();
            setTherapists(fetchedTherapists);
        };
        loadData();
    }, []);

    const whatsAppMessage = encodeURIComponent("Hello! I'd like to book a physiotherapy session.");

    return (
        <section id="therapists" className="py-24 bg-slate-900/50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Clinicians</h2>
                    <p className="text-slate-300 text-lg">
                        Our team of expert physiotherapists is dedicated to helping you achieve your recovery goals with personalized care.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {therapists.map((therapist) => (
                        <div key={therapist.id} className="bg-slate-800 rounded-xl border border-slate-700 p-8 flex flex-col md:flex-row items-center text-center md:text-left gap-8">
                            <img src={therapist.imageUrl} alt={therapist.name} className="h-24 w-24 rounded-full object-cover flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-white">{therapist.name}</h3>
                                <p className="text-sm text-cyan-400 mb-2">{therapist.title}</p>
                                <p className="text-slate-400 text-sm mb-4">{therapist.bio}</p>
                                <div className="flex justify-center md:justify-start gap-3">
                                    <button
                                        onClick={() => onBookNow(therapist)}
                                        className="bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors text-sm"
                                    >
                                        Book Online
                                    </button>
                                    <a
                                        href={`https://wa.me/${therapist.whatsappNumber}?text=${whatsAppMessage}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <WhatsAppIcon className="h-4 w-4" />
                                        Book on WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TherapistsSection;
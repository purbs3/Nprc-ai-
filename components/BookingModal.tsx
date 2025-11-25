import React, { useState, FormEvent, useEffect } from 'react';
import type { Clinician } from '../types';
import { XIcon } from './IconComponents';
import { addBooking } from '../services/bookingService';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    therapist: Clinician | null; // RENAME therapist to clinician for clarity
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, therapist: clinician }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [patientName, setPatientName] = useState('');
    const [patientContact, setPatientContact] = useState('');
    const [service, setService] = useState('Telehealth Session');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setIsSubmitting(false);
            setPatientName('');
            setPatientContact('');
            setService('Telehealth Session');
            setDate('');
            setTime('');
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen || !clinician) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addBooking({
                patientName,
                patientContact,
                clinicianId: clinician.id,
                service,
                date,
                time,
                status: 'Pending',
                notes,
            });
            setStep(2); // Move to confirmation step
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Sorry, we couldn't process your booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg m-4 relative p-8">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close modal">
                    <XIcon className="h-6 w-6" />
                </button>

                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-2">Book an Appointment</h2>
                        <p className="text-slate-300 mb-6">With <span className="font-semibold text-cyan-400">{clinician.name}</span></p>

                        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="patientName" className="block text-slate-300 mb-1">Full Name</label>
                                    <input id="patientName" type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="patientContact" className="block text-slate-300 mb-1">Email or Phone</label>
                                    <input id="patientContact" type="text" value={patientContact} onChange={e => setPatientContact(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="service" className="block text-slate-300 mb-1">Service</label>
                                    <select id="service" value={service} onChange={e => setService(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                                        <option>Telehealth Session</option>
                                        <option>Initial Consultation</option>
                                        <option>Follow-up Visit</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="date" className="block text-slate-300 mb-1">Preferred Date</label>
                                    <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="time" className="block text-slate-300 mb-1">Preferred Time</label>
                                <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                            <div>
                                <label htmlFor="notes" className="block text-slate-300 mb-1">Additional Notes (optional)</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors disabled:bg-slate-600" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting Request...' : 'Request Appointment'}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
                        <p className="text-slate-300 mb-6">Your appointment request has been submitted. We will contact you shortly to confirm.</p>
                        <button onClick={onClose} className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
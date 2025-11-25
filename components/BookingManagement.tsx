import React, { useState, useEffect } from 'react';
import type { Booking, Clinician } from '../types';
import { getBookings, saveBookings } from '../services/bookingService';
import { getClinicians } from '../services/clinicianService';

const BookingManagement: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [clinicians, setClinicians] = useState<Clinician[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [fetchedBookings, fetchedClinicians] = await Promise.all([
                getBookings(),
                getClinicians()
            ]);
            setBookings(fetchedBookings);
            setClinicians(fetchedClinicians);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
        const updatedBookings = bookings.map(b =>
            b.id === bookingId ? { ...b, status: newStatus } : b
        );
        setBookings(updatedBookings);
        await saveBookings(updatedBookings);
    };

    const getClinicianName = (id: string) => {
        return clinicians.find(c => c.id === id)?.name || 'Unknown';
    };

    const statusOptions: Booking['status'][] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    const statusColor = (status: Booking['status']) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'Confirmed': return 'bg-blue-500/20 text-blue-300';
            case 'Completed': return 'bg-green-500/20 text-green-300';
            case 'Cancelled': return 'bg-red-500/20 text-red-300';
        }
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <h1 className="text-2xl font-bold mb-6">Booking Management</h1>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50 text-sm uppercase text-slate-300">
                        <tr>
                            <th className="p-3">Patient</th>
                            <th className="p-3">Clinician</th>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Service</th>
                            <th className="p-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center p-6 text-slate-400">Loading bookings...</td>
                            </tr>
                        ) : bookings.length > 0 ? (
                            bookings.map(booking => (
                                <tr key={booking.id} className="border-b border-slate-700">
                                    <td className="p-3">
                                        <p className="font-medium">{booking.patientName}</p>
                                        <p className="text-xs text-slate-400">{booking.patientContact}</p>
                                    </td>
                                    <td className="p-3 text-slate-300">{getClinicianName(booking.clinicianId)}</td>
                                    <td className="p-3 text-slate-400">{booking.date} at {booking.time}</td>
                                    <td className="p-3 text-slate-400">{booking.service}</td>
                                    <td className="p-3 text-center">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                                            className={`text-xs font-semibold rounded-full py-1 px-2 border-2 bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${statusColor(booking.status)} border-transparent`}
                                        >
                                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-6 text-slate-400">
                                    No bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingManagement;
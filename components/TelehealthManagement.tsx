import React, { useState, useEffect, FormEvent } from 'react';
import type { TelehealthSession, Clinician } from '../types';
import { getTelehealthSessions, saveTelehealthSessions } from '../services/telehealthService';
import { getClinicians } from '../services/clinicianService';

const TelehealthManagement: React.FC = () => {
    const [sessions, setSessions] = useState<TelehealthSession[]>([]);
    const [clinicians, setClinicians] = useState<Clinician[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingSession, setEditingSession] = useState<TelehealthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [patientName, setPatientName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [status, setStatus] = useState<'Scheduled' | 'Completed' | 'Cancelled'>('Scheduled');
    const [notes, setNotes] = useState('');
    const [clinicianId, setClinicianId] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [fetchedSessions, fetchedClinicians] = await Promise.all([
                getTelehealthSessions(),
                getClinicians(),
            ]);
            setSessions(fetchedSessions);
            setClinicians(fetchedClinicians);
            if (fetchedClinicians.length > 0) {
                setClinicianId(fetchedClinicians[0].id);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleSaveChanges = async (updatedSessions: TelehealthSession[]) => {
        setSessions(updatedSessions);
        await saveTelehealthSessions(updatedSessions);
    };

    const resetForm = () => {
        setPatientName('');
        setDate('');
        setTime('');
        setStatus('Scheduled');
        setNotes('');
        setClinicianId(clinicians.length > 0 ? clinicians[0].id : '');
    };

    const handleEdit = (session: TelehealthSession) => {
        setEditingSession(session);
        setPatientName(session.patientName);
        setDate(session.date);
        setTime(session.time);
        setStatus(session.status);
        setNotes(session.notes || '');
        setClinicianId(session.clinicianId);
        setIsFormVisible(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            const updatedSessions = sessions.filter(s => s.id !== id);
            await handleSaveChanges(updatedSessions);
        }
    };

    const handleAddNew = () => {
        setEditingSession(null);
        resetForm();
        setIsFormVisible(true);
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingSession(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!clinicianId) {
            alert('Please select a clinician.');
            return;
        }
        const sessionData = { patientName, date, time, status, notes, clinicianId };

        let updatedSessions;
        if (editingSession) {
            updatedSessions = sessions.map(s => s.id === editingSession.id ? { ...s, ...sessionData } : s);
        } else {
            // FIX: Add clinicianId to the new session object to match the TelehealthSession type.
            const newSession: TelehealthSession = {
                id: Date.now().toString(),
                ...sessionData
            };
            updatedSessions = [newSession, ...sessions];
        }
        await handleSaveChanges(updatedSessions);
        setIsFormVisible(false);
    };

    const statusColor = (status: TelehealthSession['status']) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-500/20 text-blue-300';
            case 'Completed': return 'bg-green-500/20 text-green-300';
            case 'Cancelled': return 'bg-red-500/20 text-red-300';
        }
    };

    const getClinicianName = (id: string) => {
        return clinicians.find(c => c.id === id)?.username || 'Unknown';
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Telehealth Management</h1>
                {!isFormVisible && (
                    <button onClick={handleAddNew} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                        Schedule New Session
                    </button>
                )}
            </div>

            {isFormVisible ? (
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold">{editingSession ? 'Edit Session' : 'Schedule New Session'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="patientName" className="block text-slate-300 mb-1">Patient Name</label>
                            <input id="patientName" type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="clinician" className="block text-slate-300 mb-1">Clinician</label>
                            <select id="clinician" value={clinicianId} onChange={e => setClinicianId(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                                {clinicians.map(c => <option key={c.id} value={c.id}>{c.username}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-slate-300 mb-1">Date</label>
                            <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-slate-300 mb-1">Time</label>
                            <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-slate-300 mb-1">Status</label>
                            <select id="status" value={status} onChange={e => setStatus(e.target.value as TelehealthSession['status'])} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                                <option>Scheduled</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-slate-300 mb-1">Notes (optional)</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                            {editingSession ? 'Update Session' : 'Save Session'}
                        </button>
                        <button type="button" onClick={handleCancel} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50 text-sm uppercase text-slate-300">
                            <tr>
                                <th className="p-3">Patient</th>
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Clinician</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-6 text-slate-400">Loading sessions...</td>
                                </tr>
                            ) : sessions.length > 0 ? (
                                sessions.map(session => (
                                    <tr key={session.id} className="border-b border-slate-700">
                                        <td className="p-3 font-medium">{session.patientName}</td>
                                        <td className="p-3 text-slate-400">{session.date} at {session.time}</td>
                                        <td className="p-3 text-slate-400">{getClinicianName(session.clinicianId)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(session.status)}`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex gap-4 justify-end">
                                                <button onClick={() => handleEdit(session)} className="font-semibold text-cyan-400 hover:text-cyan-300">Edit</button>
                                                <button onClick={() => handleDelete(session.id)} className="font-semibold text-red-400 hover:text-red-300">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-6 text-slate-400">
                                        No telehealth sessions scheduled.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TelehealthManagement;
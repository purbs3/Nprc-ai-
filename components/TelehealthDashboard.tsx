import React, { useState, useEffect } from 'react';
import type { TelehealthSession } from '../types';
import { getTelehealthSessions, saveTelehealthSessions } from '../services/telehealthService';

interface TelehealthDashboardProps {
    clinicianId: string;
}

const TelehealthDashboard: React.FC<TelehealthDashboardProps> = ({ clinicianId }) => {
    const [sessions, setSessions] = useState<TelehealthSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSessions = async () => {
            setIsLoading(true);
            const allSessions = await getTelehealthSessions();
            const clinicianSessions = allSessions.filter(s => s.clinicianId === clinicianId);
            setSessions(clinicianSessions);
            setIsLoading(false);
        };
        loadSessions();
    }, [clinicianId]);

    const handleStatusChange = async (sessionId: string, newStatus: TelehealthSession['status']) => {
        const allSessions = await getTelehealthSessions();
        const updatedSessions = allSessions.map(s =>
            s.id === sessionId ? { ...s, status: newStatus } : s
        );
        // Save all sessions back, then update local state
        await saveTelehealthSessions(updatedSessions);
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s));
    };


    const statusColor = (status: TelehealthSession['status']) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-500/20 text-blue-300';
            case 'Completed': return 'bg-green-500/20 text-green-300';
            case 'Cancelled': return 'bg-red-500/20 text-red-300';
        }
    };

    const now = new Date();
    const upcomingSessions = sessions.filter(s => new Date(s.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastSessions = sessions.filter(s => new Date(s.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    const SessionList: React.FC<{ title: string, sessionList: TelehealthSession[] }> = ({ title, sessionList }) => (
        <div>
            <h3 className="font-semibold text-cyan-400 mb-3 text-lg">{title}</h3>
            {sessionList.length > 0 ? (
                <div className="space-y-4">
                    {sessionList.map(session => (
                        <div key={session.id} className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                <div>
                                    <p className="font-bold">{session.patientName}</p>
                                    <p className="text-sm text-slate-300">
                                        {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })} at {session.time}
                                    </p>
                                </div>
                                <div className="mt-3 sm:mt-0 flex items-center gap-4">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(session.status)}`}>
                                        {session.status}
                                    </span>
                                    {session.status === 'Scheduled' && (
                                        <button className="bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-cyan-400">Join Call</button>
                                    )}
                                </div>
                            </div>
                            {session.notes && <p className="text-xs text-slate-400 mt-2 bg-slate-900/40 p-2 rounded">Notes: {session.notes}</p>}
                            <div className="mt-2 text-right">
                                <button onClick={() => handleStatusChange(session.id, 'Completed')} className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50" disabled={session.status === 'Completed'}>Mark as Complete</button>
                                <span className="text-slate-500 mx-2">|</span>
                                <button onClick={() => handleStatusChange(session.id, 'Cancelled')} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50" disabled={session.status === 'Cancelled'}>Cancel</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 text-sm">No {title.toLowerCase()} sessions found.</p>
            )}
        </div>
    );


    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">My Telehealth Portal</h2>

            {isLoading ? (
                <p className="text-slate-400">Loading your schedule...</p>
            ) : (
                <div className="space-y-8">
                    <SessionList title="Upcoming" sessionList={upcomingSessions} />
                    <SessionList title="Past" sessionList={pastSessions} />
                </div>
            )}
        </div>
    );
};

export default TelehealthDashboard;
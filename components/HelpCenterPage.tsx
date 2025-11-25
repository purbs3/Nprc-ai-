import React, { useState, useEffect, FormEvent } from 'react';
import type { HelpTicket, CurrentUser } from '../types';
import { getTicketsForUser, addHelpTicket } from '../services/helpCenterService';
import LoadingSpinner from './LoadingSpinner';

interface HelpCenterPageProps {
    currentUser: CurrentUser;
    onNavigate: (path: string) => void;
}

const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ currentUser, onNavigate }) => {
    const [tickets, setTickets] = useState<HelpTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Form state
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadTickets = async () => {
        setIsLoading(true);
        const userTickets = await getTicketsForUser(currentUser.username);
        setTickets(userTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setIsLoading(false);
    };

    useEffect(() => {
        loadTickets();
    }, [currentUser.username]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // FIX: Prevent admins from creating tickets, as the 'admin' userType is not supported for new tickets.
        if (currentUser.type === 'admin') {
            alert("Admin accounts cannot create support tickets.");
            setIsSubmitting(false);
            return;
        }

        await addHelpTicket({
            userId: currentUser.username,
            userType: currentUser.type,
            subject,
            message,
        });
        // Reset form and reload tickets
        setSubject('');
        setMessage('');
        setIsFormVisible(false);
        setIsSubmitting(false);
        loadTickets();
    };

    const statusColor = (status: HelpTicket['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-500/20 text-blue-300';
            case 'In Progress': return 'bg-yellow-500/20 text-yellow-300';
            case 'Closed': return 'bg-red-500/20 text-red-300';
        }
    };

    return (
        <section className="py-24 bg-slate-900 animate-fadeIn min-h-[80vh]">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold !text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                        Help Center
                    </h1>
                    <button onClick={() => setIsFormVisible(prev => !prev)} className="bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-400 font-semibold">
                        {isFormVisible ? 'Cancel' : 'Create New Ticket'}
                    </button>
                </div>

                {isFormVisible && (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h2 className="text-xl font-bold">Submit a new request</h2>
                            <div>
                                <label htmlFor="subject" className="block text-slate-300 mb-1">Subject</label>
                                <input id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-slate-300 mb-1">How can we help?</label>
                                <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={5} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 disabled:bg-slate-600">
                                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold p-6">My Support Tickets</h2>
                    {isLoading ? <div className="py-8"><LoadingSpinner /></div> : (
                        <div className="space-y-2 p-6 pt-0">
                            {tickets.length > 0 ? tickets.map(ticket => (
                                <button key={ticket.id} onClick={() => onNavigate(`/help/${ticket.id}`)} className="w-full text-left bg-slate-800 p-4 rounded-lg hover:bg-slate-700 transition-colors flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{ticket.subject}</p>
                                        <p className="text-xs text-slate-400">Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(ticket.status)}`}>{ticket.status}</span>
                                </button>
                            )) : <p className="text-slate-400 text-center py-4">You have no support tickets.</p>}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HelpCenterPage;
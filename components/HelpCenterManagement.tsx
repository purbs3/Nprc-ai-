import React, { useState, useEffect, FormEvent } from 'react';
import type { HelpTicket, HelpTicketReply } from '../types';
import { getHelpTickets, updateTicketStatus, addReplyToTicket } from '../services/helpCenterService';
import { XIcon } from './IconComponents';

const TicketDetailsModal: React.FC<{ ticket: HelpTicket, onClose: () => void, onUpdate: (updatedTicket: HelpTicket) => void }> = ({ ticket, onClose, onUpdate }) => {
    const [status, setStatus] = useState<HelpTicket['status']>(ticket.status);
    const [reply, setReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStatusChange = async (newStatus: HelpTicket['status']) => {
        setStatus(newStatus);
        const updatedTicket = await updateTicketStatus(ticket.id, newStatus);
        if (updatedTicket) onUpdate(updatedTicket);
    };

    const handleReplySubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setIsSubmitting(true);
        const updatedTicket = await addReplyToTicket(ticket.id, {
            authorName: 'Admin',
            authorType: 'Admin',
            message: reply,
        });
        if (updatedTicket) {
            onUpdate(updatedTicket);
            setReply('');
        }
        setIsSubmitting(false);
    };

    const formatDate = (isoString: string) => new Date(isoString).toLocaleString();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" role="dialog">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl m-4 relative p-8">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold">{ticket.subject}</h2>
                        <p className="text-sm text-slate-400">From: {ticket.userId} ({ticket.userType})</p>
                    </div>
                    <select value={status} onChange={(e) => handleStatusChange(e.target.value as HelpTicket['status'])} className="bg-slate-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto bg-slate-900/50 p-4 rounded-lg">
                    <div className="bg-slate-700 p-3 rounded-lg">
                        <p className="font-semibold">{ticket.userId}</p>
                        <p className="text-xs text-slate-400 mb-2">{formatDate(ticket.createdAt)}</p>
                        <p className="text-slate-300 whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                    {ticket.replies.map(r => (
                        <div key={r.id} className={`${r.authorType === 'Admin' ? 'bg-cyan-900/50' : 'bg-slate-700'} p-3 rounded-lg`}>
                            <p className={`font-semibold ${r.authorType === 'Admin' ? 'text-cyan-400' : ''}`}>{r.authorName}</p>
                            <p className="text-xs text-slate-400 mb-2">{formatDate(r.createdAt)}</p>
                            <p className="text-slate-300 whitespace-pre-wrap">{r.message}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleReplySubmit} className="mt-6">
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="Write a reply..." required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    <button type="submit" disabled={isSubmitting} className="mt-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 disabled:bg-slate-600">
                        {isSubmitting ? 'Sending...' : 'Send Reply'}
                    </button>
                </form>
            </div>
        </div>
    );
};


const HelpCenterManagement: React.FC = () => {
    const [tickets, setTickets] = useState<HelpTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<HelpTicket | null>(null);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setIsLoading(true);
        const fetchedTickets = await getHelpTickets();
        setTickets(fetchedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setIsLoading(false);
    };

    const handleUpdateTicket = (updatedTicket: HelpTicket) => {
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket); // Keep modal open with updated info
    };

    const statusColor = (status: HelpTicket['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-500/20 text-blue-300';
            case 'In Progress': return 'bg-yellow-500/20 text-yellow-300';
            case 'Closed': return 'bg-red-500/20 text-red-300';
        }
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <h1 className="text-2xl font-bold mb-6">Help Center Management</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50 text-sm uppercase text-slate-300">
                        <tr>
                            <th className="p-3">Subject</th>
                            <th className="p-3">User</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-6 text-slate-400">Loading tickets...</td></tr>
                        ) : tickets.map(ticket => (
                            <tr key={ticket.id} className="border-b border-slate-700">
                                <td className="p-3 font-medium">{ticket.subject}</td>
                                <td className="p-3 text-slate-400">{ticket.userId}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(ticket.status)}`}>{ticket.status}</span></td>
                                <td className="p-3 text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => setSelectedTicket(ticket)} className="font-semibold text-cyan-400 hover:text-cyan-300">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedTicket && <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={handleUpdateTicket} />}
        </div>
    );
};

export default HelpCenterManagement;
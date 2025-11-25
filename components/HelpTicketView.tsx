import React, { useState, useEffect, FormEvent } from 'react';
import type { HelpTicket, CurrentUser } from '../types';
import { getHelpTickets, addReplyToTicket } from '../services/helpCenterService';
import LoadingSpinner from './LoadingSpinner';

interface HelpTicketViewProps {
    ticketId: string;
    currentUser: CurrentUser;
    onNavigate: (path: string) => void;
}

const HelpTicketView: React.FC<HelpTicketViewProps> = ({ ticketId, currentUser, onNavigate }) => {
    const [ticket, setTicket] = useState<HelpTicket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadTicket = async () => {
        const allTickets = await getHelpTickets();
        const foundTicket = allTickets.find(t => t.id === ticketId);
        // Security check: ensure the current user owns this ticket
        if (foundTicket && foundTicket.userId.toLowerCase() === currentUser.username.toLowerCase()) {
            setTicket(foundTicket);
        } else {
            setTicket(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadTicket();
    }, [ticketId, currentUser.username]);

    const handleSubmitReply = async (e: FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !ticket) return;

        setIsSubmitting(true);
        // FIX: Convert currentUser.type to the PascalCase expected by HelpTicketReply['authorType'].
        const authorType = (currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1)) as 'User' | 'Clinician' | 'Admin';
        const updatedTicket = await addReplyToTicket(ticket.id, {
            authorName: currentUser.username,
            authorType: authorType,
            message: replyContent,
        });

        if (updatedTicket) {
            setTicket(updatedTicket);
            setReplyContent('');
        }
        setIsSubmitting(false);
    };

    const formatDate = (isoString: string) => new Date(isoString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    if (isLoading) {
        return <div className="text-center py-24"><LoadingSpinner /></div>;
    }

    if (!ticket) {
        return <div className="text-center py-24 text-slate-400">Ticket not found or you do not have permission to view it.</div>;
    }

    return (
        <section className="py-24 bg-slate-900 animate-fadeIn min-h-[80vh]">
            <div className="container mx-auto px-6 max-w-3xl">
                <button onClick={() => onNavigate('/help')} className="mb-8 text-cyan-400 hover:text-cyan-300 font-semibold">&larr; Back to Help Center</button>
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">{ticket.subject}</h1>
                    <p className="text-slate-400 mt-1">Status: {ticket.status}</p>
                </header>
                <div className="space-y-6">
                    {/* Original message */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <p className="font-semibold text-cyan-400">{ticket.userId}</p>
                        <p className="text-xs text-slate-400 mb-4">{formatDate(ticket.createdAt)}</p>
                        <p className="text-slate-200 whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                    {/* Replies */}
                    {ticket.replies.map(reply => (
                        <div key={reply.id} className={`${reply.authorType === 'Admin' ? 'bg-cyan-900/50 border-cyan-800' : 'bg-slate-800 border-slate-700'} p-6 rounded-xl border`}>
                            <p className={`font-semibold ${reply.authorType === 'Admin' ? 'text-cyan-300' : 'text-cyan-400'}`}>{reply.authorName}</p>
                            <p className="text-xs text-slate-400 mb-4">{formatDate(reply.createdAt)}</p>
                            <p className="text-slate-200 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                    ))}
                </div>

                {ticket.status !== 'Closed' && (
                    <div className="mt-12 pt-8 border-t border-slate-700">
                        <h2 className="text-2xl font-bold mb-4">Post a Reply</h2>
                        <form onSubmit={handleSubmitReply} className="space-y-4">
                            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={5} required className="w-full bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none" />
                            <button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-400 font-semibold disabled:bg-slate-600">
                                {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HelpTicketView;
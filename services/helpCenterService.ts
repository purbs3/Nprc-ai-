// src/api/helpdesk.ts
import type { HelpTicket, HelpTicketReply } from '../types';

const TICKETS_KEY = 'nprc-help-tickets';

const getInitialTickets = (): HelpTicket[] => [
    {
        id: 'ht1',
        userId: 'sarahj',
        userType: 'user',
        subject: 'Trouble with exercise recommendations',
        message: "Hi, the app keeps suggesting the same knee exercise even after I marked it as completed.",
        status: 'Open',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        replies: [],
    },
    {
        id: 'ht2',
        userId: 'purab',
        userType: 'clinician',
        subject: 'Posture Analysis Results',
        message: 'The last posture analysis report was incomplete.',
        status: 'In Progress',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        replies: [
            {
                id: 'htr1',
                authorName: 'Admin',
                authorType: 'Admin',
                message: "Hi Dr. Purab, we’re looking into the issue.",
                createdAt: new Date(Date.now() - 43200000).toISOString(),
            }
        ]
    }
];

const getFromStorage = async <T>(key: string, initialData: T[]): Promise<T[]> => {
    await new Promise(r => setTimeout(r, 100));
    try {
        const json = localStorage.getItem(key);
        if (json) {
            const data = JSON.parse(json);
            if (Array.isArray(data)) return data;
        }
    } catch (e) {
        console.error(`Failed to load ${key}:`, e);
    }
    await saveToStorage(key, initialData);
    return initialData;
};

const saveToStorage = async <T>(key: string, data: T[]): Promise<void> => {
    await new Promise(r => setTimeout(r, 100));
    localStorage.setItem(key, JSON.stringify(data));
};

export const getHelpTickets = async (): Promise<HelpTicket[]> => getFromStorage(TICKETS_KEY, getInitialTickets());

export const getTicketsForUser = async (username: string): Promise<HelpTicket[]> => {
    const all = await getHelpTickets();
    return all.filter(t => t.userId.toLowerCase() === username.toLowerCase());
};

export const addHelpTicket = async (
    ticketData: Omit<HelpTicket, 'id' | 'createdAt' | 'replies' | 'status'>
): Promise<HelpTicket> => {
    const tickets = await getHelpTickets();
    const newTicket: HelpTicket = {
        ...ticketData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'Open',
        replies: [],
    };
    await saveToStorage(TICKETS_KEY, [newTicket, ...tickets]);
    return newTicket;
};

export const addReplyToTicket = async (
    ticketId: string,
    replyData: Omit<HelpTicketReply, 'id' | 'createdAt'>
): Promise<HelpTicket | null> => {
    const tickets = await getHelpTickets();
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) return null;

    const newReply: HelpTicketReply = {
        ...replyData,
        id: `r-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };

    tickets[index].replies.push(newReply);
    if (replyData.authorType === 'Admin' && tickets[index].status === 'Open') {
        tickets[index].status = 'In Progress';
    }

    await saveToStorage(TICKETS_KEY, tickets);
    return tickets[index];
};

export const updateTicketStatus = async (ticketId: string, status: HelpTicket['status']): Promise<HelpTicket | null> => {
    const tickets = await getHelpTickets();
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) return null;

    tickets[index].status = status;
    await saveToStorage(TICKETS_KEY, tickets);
    return tickets[index];
};

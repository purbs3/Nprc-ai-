import React, { useState, useEffect } from 'react';
import type { ChatMessage, ChartDataPoint, TelehealthSession } from '../types';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';

// --- API Base URL (must match ASP.NET backend) ---
const API_BASE_URL = 'http://localhost:3001/api';

// Local key (for user-side chat logs)
const CHAT_HISTORY_KEY = 'nprc-chat-history';

// 🔹 Helper: Extract common keywords from chat
const processCommonKeywords = (chatHistory: ChatMessage[]): ChartDataPoint[] => {
    const keywords = ['knee', 'back', 'shoulder', 'neck', 'hip', 'ankle', 'wrist', 'elbow'];
    const keywordCounts: Record<string, number> = Object.fromEntries(keywords.map(k => [k, 0]));

    chatHistory.forEach(msg => {
        if (msg.role === 'user') {
            const content = msg.content.toLowerCase();
            keywords.forEach(keyword => {
                if (content.includes(keyword)) keywordCounts[keyword]++;
            });
        }
    });

    return Object.entries(keywordCounts)
        .map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value }))
        .sort((a, b) => b.value - a.value)
        .filter(d => d.value > 0);
};

// 🔹 Helper: Process telehealth sessions by status
const processTelehealthStatus = (sessions: TelehealthSession[]): ChartDataPoint[] => {
    const statusCounts = { Scheduled: 0, Completed: 0, Cancelled: 0 };
    sessions.forEach(s => (statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1));

    return [
        { label: 'Scheduled', value: statusCounts.Scheduled, color: '#22d3ee' },
        { label: 'Completed', value: statusCounts.Completed, color: '#34d399' },
        { label: 'Cancelled', value: statusCounts.Cancelled, color: '#f87171' },
    ];
};

// 🔹 Helper: Process sessions by month
const processSessionsByMonth = (sessions: TelehealthSession[]): ChartDataPoint[] => {
    const monthCounts: Record<string, number> = {};
    sessions.forEach(session => {
        const d = new Date(session.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthCounts[key] = (monthCounts[key] ?? 0) + 1;
    });

    return Object.entries(monthCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => {
            const [year, month] = key.split('-').map(Number);
            const label = new Date(year, month).toLocaleString('default', {
                month: 'short',
                year: '2-digit',
            });
            return { label, value };
        });
};

// 🔹 Main Component
const ActivityDashboard: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [telehealthStatusData, setTelehealthStatusData] = useState<ChartDataPoint[]>([]);
    const [sessionsByMonthData, setSessionsByMonthData] = useState<ChartDataPoint[]>([]);
    const [commonKeywordsData, setCommonKeywordsData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Load chat history (local user-specific)
                const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
                const parsedMessages = savedMessages ? JSON.parse(savedMessages) : [];
                setChatHistory(parsedMessages);
                setCommonKeywordsData(processCommonKeywords(parsedMessages));

                // ✅ Fetch telehealth sessions from ASP.NET backend
                const response = await fetch(`${API_BASE_URL}/telehealth/sessions`, {
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error(`Backend error: ${response.status}`);
                }

                const sessions: TelehealthSession[] = await response.json();
                setTelehealthStatusData(processTelehealthStatus(sessions));
                setSessionsByMonthData(processSessionsByMonth(sessions));
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setError("Failed to load data. Please check backend connection.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const totalMessages = chatHistory.length;
    const userMessages = chatHistory.filter(msg => msg.role === 'user').length;
    const modelMessages = chatHistory.filter(msg => msg.role === 'model').length;

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 animate-fadeIn">
            <h1 className="text-2xl font-bold mb-6">Activity Dashboard</h1>

            {error && (
                <div className="bg-red-500/20 border border-red-400 text-red-300 p-3 mb-6 rounded-lg">
                    {error}
                </div>
            )}

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-700 p-6 rounded-lg text-center">
                    <p className="text-slate-400 text-sm">Total Messages</p>
                    <p className="text-3xl font-bold text-cyan-400">{totalMessages}</p>
                </div>
                <div className="bg-slate-700 p-6 rounded-lg text-center">
                    <p className="text-slate-400 text-sm">User Messages</p>
                    <p className="text-3xl font-bold">{userMessages}</p>
                </div>
                <div className="bg-slate-700 p-6 rounded-lg text-center">
                    <p className="text-slate-400 text-sm">AI Responses</p>
                    <p className="text-3xl font-bold">{modelMessages}</p>
                </div>
            </div>

            {/* Charts Section */}
            {isLoading ? (
                <p className="text-slate-400 text-center py-8">Loading chart data...</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2">
                        <DoughnutChart title="Telehealth Session Status" data={telehealthStatusData} />
                    </div>
                    <div className="lg:col-span-3">
                        <BarChart title="Monthly Session Volume" data={sessionsByMonthData} />
                    </div>
                    <div className="lg:col-span-5">
                        <BarChart title="Common User Inquiry Topics" data={commonKeywordsData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityDashboard;

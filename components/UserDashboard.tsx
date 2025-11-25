import React from 'react';
import ChatInterface from './ChatInterface';
import Header from './Header';
import { authService } from '../services/authService';
import type { CurrentUser } from '../types';
import { useNavigate } from 'react-router-dom'; // Placeholder, using props for nav

interface UserDashboardProps {
    currentUser: CurrentUser;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser }) => {

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/'; // Force reload to home
    };

    const handleNavigate = (path: string) => {
        window.location.href = path;
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900">
            <Header currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
            <div className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 flex">
                <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full h-full flex flex-col">
                    <div className="p-4 border-b border-slate-700">
                        <h1 className="text-xl font-bold">AI Symptom Checker</h1>
                        <p className="text-sm text-slate-400">Chat with our AI to understand your symptoms.</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ChatInterface userType="user" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

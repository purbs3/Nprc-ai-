import React, { useState } from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';
import PostureAnalysis from './PostureAnalysis';
import GaitAnalysis from './GaitAnalysis';
import TelehealthDashboard from './TelehealthDashboard';
import { authService } from '../services/authService';
import type { CurrentUser } from '../types';
import { PostureIcon, MotionIcon, UsersIcon, HealthIcon } from './IconComponents';

interface ClinicianDashboardProps {
    currentUser: CurrentUser;
}

type ClinicianTab = 'chat' | 'posture' | 'gait' | 'telehealth';

const ClinicianDashboard: React.FC<ClinicianDashboardProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<ClinicianTab>('chat');

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/'; // Force reload to home
    };

    const handleNavigate = (path: string) => {
        window.location.href = path;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full h-full flex flex-col">
                        <div className="p-4 border-b border-slate-700">
                            <h1 className="text-xl font-bold">AI Clinical Assistant</h1>
                            <p className="text-sm text-slate-400">Ask clinical questions, get differential diagnoses, and more.</p>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface userType="clinician" />
                        </div>
                    </div>
                );
            case 'posture':
                return <PostureAnalysis />;
            case 'gait':
                return <GaitAnalysis />;
            case 'telehealth':
                return <TelehealthDashboard clinicianId={currentUser.id} />;
        }
    }

    const NavButton: React.FC<{ tab: ClinicianTab, icon: React.FC<{ className?: string }>, label: string }> = ({ tab, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 p-3 rounded-lg w-full text-left transition-colors ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-700'
                }`}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-900">
            <Header currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
            <div className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 flex gap-8 overflow-hidden">
                <aside className="w-64 flex-shrink-0 bg-slate-800 rounded-xl border border-slate-700 p-4 flex-col hidden md:flex">
                    <h2 className="text-lg font-bold mb-4 px-2">Tools</h2>
                    <nav className="space-y-2">
                        <NavButton tab="chat" icon={HealthIcon} label="AI Assistant" />
                        <NavButton tab="posture" icon={PostureIcon} label="Posture Analysis" />
                        <NavButton tab="gait" icon={MotionIcon} label="Gait Analysis" />
                        <NavButton tab="telehealth" icon={UsersIcon} label="Telehealth" />
                    </nav>
                </aside>
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default ClinicianDashboard;

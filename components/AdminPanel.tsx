import React, { useState } from 'react';
import ActivityDashboard from './ActivityDashboard';
import BlogManagement from './BlogManagement';
import TelehealthManagement from './TelehealthManagement';
import TreatmentPlanManagement from './TreatmentPlanManagement';
import WorkshopManagement from './WorkshopManagement';
import FeedbackManagement from './FeedbackManagement';
import SettingsManagement from './SettingsManagement';
import ClinicianManagement from './ClinicianManagement';
import BookingManagement from './BookingManagement';
import UserManagement from './UserManagement';
import SEOManagement from './SEOManagement';

interface AdminPanelProps {
    onLogout: () => void;
}

type AdminTab = 'activity' | 'clinicians' | 'users' | 'bookings' | 'blog' | 'telehealth' | 'plans' | 'workshops' | 'feedback' | 'settings' | 'seo';

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('activity');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'activity':
                return <ActivityDashboard />;
            case 'clinicians':
                return <ClinicianManagement />;
            case 'users':
                return <UserManagement />;
            case 'bookings':
                return <BookingManagement />;
            case 'blog':
                return <BlogManagement />;
            case 'telehealth':
                return <TelehealthManagement />;
            case 'plans':
                return <TreatmentPlanManagement />;
            case 'workshops':
                return <WorkshopManagement />;
            case 'feedback':
                return <FeedbackManagement />;
            case 'settings':
                return <SettingsManagement />;
            case 'seo':
                return <SEOManagement />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
            <div className="container mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Admin Panel</h1>
                    <button
                        onClick={onLogout}
                        className="bg-slate-700 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Logout
                    </button>
                </header>

                <nav className="flex flex-wrap gap-2 md:space-x-4 mb-8 border-b border-slate-700 pb-4">
                    <TabButton tab="activity" label="Activity" />
                    <TabButton tab="clinicians" label="Clinicians" />
                    <TabButton tab="users" label="Users" />
                    <TabButton tab="bookings" label="Bookings" />
                    <TabButton tab="blog" label="Blog" />
                    <TabButton tab="seo" label="SEO Analysis" />
                    <TabButton tab="telehealth" label="Telehealth" />
                    <TabButton tab="plans" label="Treatment Plans" />
                    <TabButton tab="workshops" label="Workshops" />
                    <TabButton tab="feedback" label="Feedback" />
                    <TabButton tab="settings" label="Settings" />
                </nav>

                <main>
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;

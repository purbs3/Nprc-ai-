import React, { useState, useEffect, FormEvent } from 'react';
import { getSettings, saveSettings, getAdminPassword, saveAdminPassword } from '../services/settingsService';
import type { AppSettings } from '../types';

const SettingsManagement: React.FC = () => {
    // General Settings State
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [generalSaveStatus, setGeneralSaveStatus] = useState('');

    // Security Settings State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaveStatus, setPasswordSaveStatus] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            const fetchedSettings = await getSettings();
            setSettings(fetchedSettings);
        };
        loadSettings();
    }, []);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => (prev ? { ...prev, [name]: value } : null));
    };

    const handleGeneralSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        await saveSettings(settings);
        setGeneralSaveStatus('Settings saved successfully!');
        // Trigger a refresh of the page to apply new appName etc. globally
        setTimeout(() => {
            setGeneralSaveStatus('');
            window.location.reload();
        }, 1500);
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSaveStatus('');

        const storedPassword = await getAdminPassword();
        if (currentPassword !== storedPassword) {
            setPasswordError('Current password is incorrect.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        await saveAdminPassword(newPassword);
        setPasswordSaveStatus('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSaveStatus(''), 3000);
    };

    if (!settings) {
        return <p>Loading settings...</p>;
    }

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-8 animate-fadeIn">
            {/* General Settings */}
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
                <h1 className="text-2xl font-bold">Settings</h1>
                <div className="bg-slate-700/50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">General Settings</h2>
                    <div>
                        <label htmlFor="appName" className="block text-slate-300 mb-1">App Name</label>
                        <input id="appName" name="appName" type="text" value={settings.appName} onChange={handleSettingsChange} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="contactEmail" className="block text-slate-300 mb-1 mt-4">Contact Email</label>
                        <input id="contactEmail" name="contactEmail" type="email" value={settings.contactEmail} onChange={handleSettingsChange} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="whatsappNumber" className="block text-slate-300 mb-1 mt-4">WhatsApp Booking Number</label>
                        <input id="whatsappNumber" name="whatsappNumber" type="tel" value={settings.whatsappNumber} onChange={handleSettingsChange} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-4 mt-6">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">Save General Settings</button>
                        {generalSaveStatus && <p className="text-green-400 text-sm">{generalSaveStatus}</p>}
                    </div>
                </div>
            </form>

            {/* Security Settings */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="bg-slate-700/50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Security</h2>
                    <div>
                        <label htmlFor="currentPassword" className="block text-slate-300 mb-1">Current Password</label>
                        <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-slate-300 mb-1">New Password</label>
                            <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-slate-300 mb-1">Confirm New Password</label>
                            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-6">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">Update Password</button>
                        {passwordSaveStatus && <p className="text-green-400 text-sm">{passwordSaveStatus}</p>}
                        {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SettingsManagement;

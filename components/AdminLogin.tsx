import React, { useState, FormEvent } from 'react';
import { HealthIcon } from './IconComponents';
import { getAdminPassword } from '../services/settingsService';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        const adminPassword = await getAdminPassword();
        if (password === adminPassword) {
            onLoginSuccess();
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
        setIsLoggingIn(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-8">
                <HealthIcon className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">NPRC Physio - Admin Panel</span>
            </div>
            <div className="w-full max-w-sm bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
                <h1 className="text-2xl font-bold text-center text-white mb-6">Admin Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password-input" className="block text-slate-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors disabled:bg-slate-600"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

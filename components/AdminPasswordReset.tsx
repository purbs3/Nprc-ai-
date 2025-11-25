import React, { useEffect } from 'react';
import { saveAdminPassword } from '../services/settingsService';

interface AdminPasswordResetProps {
    onNavigate: (path: string) => void;
}

const AdminPasswordReset: React.FC<AdminPasswordResetProps> = ({ onNavigate }) => {
    useEffect(() => {
        // This effect runs once on component mount, resetting the password.
        const resetPassword = async () => {
            await saveAdminPassword('admin');
        };
        resetPassword();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl border border-slate-700 text-center shadow-2xl shadow-cyan-500/10">
                <h1 className="text-2xl font-bold text-green-400 mb-4">Password Reset Successful</h1>
                <p className="text-slate-300 mb-6">
                    The admin password has been reset to the default: <strong className="font-mono text-cyan-400 bg-slate-700 px-2 py-1 rounded">admin</strong>
                </p>
                <button
                    onClick={() => onNavigate('/admin')}
                    className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
                >
                    Go to Admin Login
                </button>
            </div>
        </div>
    );
};

export default AdminPasswordReset;

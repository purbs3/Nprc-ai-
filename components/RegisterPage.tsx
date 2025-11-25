import React, { useState, FormEvent } from 'react';
import { HealthIcon } from './IconComponents';
import { authService } from '../services/authService';

interface RegisterPageProps {
    onRegisterSuccess: () => void;
    onNavigate: (path: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigate }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'clinician'>('user');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        setError('');

        try {
            const user = await authService.register(username, email, role);
            if (user) {
                onRegisterSuccess();
            } else {
                setError('Could not complete registration.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => onNavigate('/')}>
                <HealthIcon className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">NPRC Physio</span>
            </div>
            <div className="w-full max-w-sm bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
                <h1 className="text-2xl font-bold text-center text-white mb-6">Create Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username-input" className="block text-slate-300 mb-2">Full Name</label>
                        <input id="username-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="email-input" className="block text-slate-300 mb-2">Email Address</label>
                        <input id="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="password-input" className="block text-slate-300 mb-2">Password</label>
                        <input id="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <p className="text-slate-300 mb-2">I am a:</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setRole('user')} className={`w-full py-2 rounded-lg font-semibold border-2 ${role === 'user' ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-700 border-slate-600 hover:border-cyan-500'}`}>Patient</button>
                            <button type="button" onClick={() => setRole('clinician')} className={`w-full py-2 rounded-lg font-semibold border-2 ${role === 'clinician' ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-700 border-slate-600 hover:border-cyan-500'}`}>Clinician</button>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 disabled:bg-slate-600 !mt-6" disabled={isRegistering}>
                        {isRegistering ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-slate-400 text-sm mt-6">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('/login')} className="font-semibold text-cyan-400 hover:text-cyan-300">Login</button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

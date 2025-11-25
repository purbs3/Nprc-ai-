import React, { useState, FormEvent } from 'react';
import { HealthIcon } from './IconComponents';
import { authService } from '../services/authService';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onNavigate: (path: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        try {
            // NOTE: Password is not checked in this demo implementation
            const user = await authService.login(email);
            if (user) {
                onLoginSuccess();
            } else {
                setError('No account found with that email address.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => onNavigate('/')}>
                <HealthIcon className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">NPRC Physio</span>
            </div>
            <div className="w-full max-w-sm bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
                <h1 className="text-2xl font-bold text-center text-white mb-6">Welcome Back</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email-input" className="block text-slate-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password-input" className="block text-slate-300">
                                Password
                            </label>
                            <button type="button" onClick={() => onNavigate('/forgot-password')} className="text-sm text-cyan-400 hover:text-cyan-300">Forgot?</button>
                        </div>
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
                <p className="text-center text-slate-400 text-sm mt-6">
                    Don't have an account?{' '}
                    <button onClick={() => onNavigate('/register')} className="font-semibold text-cyan-400 hover:text-cyan-300">Register</button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

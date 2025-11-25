import React, { useState, FormEvent } from 'react';
import { HealthIcon } from './IconComponents';

interface ForgotPasswordPageProps {
    onNavigate: (path: string) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => onNavigate('/')}>
                <HealthIcon className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">NPRC Physio</span>
            </div>
            <div className="w-full max-w-sm bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
                {isSubmitted ? (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
                        <p className="text-slate-300 mb-6">
                            If an account exists for <span className="font-semibold text-cyan-400">{email}</span>, you will receive an email with instructions on how to reset your password.
                        </p>
                        <button
                            onClick={() => onNavigate('/login')}
                            className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-center text-white mb-2">Reset Password</h1>
                        <p className="text-slate-400 text-center mb-6 text-sm">Enter your email and we'll send you a reset link.</p>
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
                                    className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 disabled:bg-slate-600"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                        <p className="text-center text-slate-400 text-sm mt-6">
                            Remember your password?{' '}
                            <button onClick={() => onNavigate('/login')} className="font-semibold text-cyan-400 hover:text-cyan-300">Login</button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

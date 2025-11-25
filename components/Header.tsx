import React, { useState, useEffect } from 'react';
import { HealthIcon } from './IconComponents';
import HamburgerCrossIcon from './HamburgerCrossIcon';
import { getSettings } from '../services/settingsService';
import type { AppSettings, CurrentUser } from '../types';

interface HeaderProps {
    currentUser: CurrentUser | null;
    onNavigate: (path: string) => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onNavigate, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const fetchedSettings = await getSettings();
            setSettings(fetchedSettings);
        };
        loadSettings();
    }, []);

    const handleLinkClick = (path: string) => {
        setIsMenuOpen(false);
        onNavigate(path);
    };

    const handleScrollLink = (selector: string) => {
        setIsMenuOpen(false);
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const handleActionClick = (action: () => void) => {
        setIsMenuOpen(false);
        action();
    };

    const navItems = currentUser ? (
        [
            { label: 'Dashboard', action: () => handleLinkClick('/dashboard') },
            { label: 'Help Center', action: () => handleLinkClick('/help') },
        ]
    ) : (
        [
            { label: 'Features', action: () => handleScrollLink('#features') },
            { label: 'Pricing', action: () => handleScrollLink('#pricing') },
            { label: 'Blog', action: () => handleLinkClick('/blog') },
        ]
    );

    return (
        <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur-md border-b border-slate-800">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => handleLinkClick('/')} className="flex items-center gap-2 cursor-pointer z-[60]">
                    <HealthIcon className="h-7 w-7 text-cyan-400" />
                    <span className="text-xl font-bold text-white">{settings?.appName || 'Loading...'}</span>
                </button>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6 text-slate-300">
                    {navItems.map(item =>
                        <button key={item.label} onClick={item.action} className="hover:text-cyan-400 transition-colors duration-300">{item.label}</button>
                    )}
                    {currentUser ? (
                        <button onClick={() => handleActionClick(onLogout)} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors duration-300">
                            Logout
                        </button>
                    ) : (
                        <div className="space-x-4">
                            <button onClick={() => handleLinkClick('/login')} className="hover:text-cyan-400 transition-colors duration-300">Login</button>
                            <button onClick={() => handleLinkClick('/register')} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors duration-300">
                                Register
                            </button>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden z-[60]">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                        className="p-2 rounded-md bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
                    >
                        <HamburgerCrossIcon isOpen={isMenuOpen} />
                    </button>
                </div>

                {/* Mobile Nav Overlay & Panel */}
                <div
                    className={`md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                    onClick={() => setIsMenuOpen(false)}
                />
                <div
                    className={`md:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-slate-800 shadow-xl p-8 pt-24 transition-transform duration-300 ease-in-out z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <nav className="flex flex-col items-start space-y-6 text-slate-300 text-xl">
                        {navItems.map(item =>
                            <button key={item.label} onClick={item.action} className="hover:text-cyan-400 transition-colors duration-300 text-left">{item.label}</button>
                        )}
                        {currentUser ? (
                            <button onClick={() => handleActionClick(onLogout)} className="mt-6 w-full text-center bg-cyan-500 text-white px-4 py-3 rounded-lg hover:bg-cyan-400 transition-colors duration-300">
                                Logout
                            </button>
                        ) : (
                            <div className="w-full pt-6 border-t border-slate-700 space-y-4">
                                <button onClick={() => handleLinkClick('/login')} className="w-full text-center bg-slate-700 text-white px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors duration-300">Login</button>
                                <button onClick={() => handleLinkClick('/register')} className="w-full text-center bg-cyan-500 text-white px-4 py-3 rounded-lg hover:bg-cyan-400 transition-colors duration-300">Register</button>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
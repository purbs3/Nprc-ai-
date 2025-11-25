import React, { useState, useEffect } from 'react';
import { HealthIcon } from './IconComponents';
import { getSettings } from '../services/settingsService';
import { AppSettings } from '../types';

interface FooterProps {
    onAdminClick: () => void;
    onNavigate: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick, onNavigate }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const fetchedSettings = await getSettings();
            setSettings(fetchedSettings);
        };
        loadSettings();
    }, []);

    const handleScrollLink = (selector: string) => {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            onNavigate('/');
            setTimeout(() => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' }), 200);
        }
    }


    return (
        <footer className="bg-slate-900 border-t border-slate-800">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                            <HealthIcon className="h-7 w-7 text-cyan-400" />
                            <span className="text-xl font-bold text-white">{settings?.appName || '...'}</span>
                        </div>
                        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} {settings?.appName || '...'}. All rights reserved.</p>
                    </div>

                    <div className="text-slate-300">
                        <h4 className="font-semibold mb-3">Product</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><button onClick={() => handleScrollLink('#features')} className="hover:text-cyan-400">Features</button></li>
                            <li><button onClick={() => handleScrollLink('#pricing')} className="hover:text-cyan-400">Pricing</button></li>
                            <li><button onClick={() => onNavigate('/login')} className="hover:text-cyan-400">Login</button></li>
                        </ul>
                    </div>
                    <div className="text-slate-300">
                        <h4 className="font-semibold mb-3">Resources</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><button onClick={() => onNavigate('/blog')} className="hover:text-cyan-400">Blog</button></li>
                            <li><button onClick={() => onNavigate('/help')} className="hover:text-cyan-400">Help Center</button></li>
                        </ul>
                    </div>
                    <div className="text-slate-300">
                        <h4 className="font-semibold mb-3">Legal</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><button onClick={() => onNavigate('/terms')} className="hover:text-cyan-400 transition-colors duration-300">Terms</button></li>
                            <li><button onClick={() => onNavigate('/privacy')} className="hover:text-cyan-400 transition-colors duration-300">Privacy</button></li>
                            <li><button onClick={onAdminClick} className="hover:text-cyan-400 transition-colors duration-300">Admin</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
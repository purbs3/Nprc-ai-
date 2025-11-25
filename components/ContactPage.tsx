import React, { useState, useEffect } from 'react';
import { getSettings } from '../services/settingsService';
import { AppSettings } from '../types';

interface StaticPageProps {
    onGoBack: () => void;
}

const ContactPage: React.FC<StaticPageProps> = ({ onGoBack }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const fetchedSettings = await getSettings();
            setSettings(fetchedSettings);
            document.title = `Contact Us - ${fetchedSettings.appName}`;
        };
        window.scrollTo(0, 0);
        loadSettings();
    }, []);

    return (
        <div className="container mx-auto px-6 py-16 max-w-4xl animate-fadeIn">
            <button onClick={onGoBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-semibold">
                &larr; Back to Home
            </button>
            <div className="prose prose-slate prose-invert lg:prose-xl mx-auto text-center">
                <h1 className="!text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Contact Us</h1>
                {settings && (
                    <p>Have questions or need to get in touch? We'd love to hear from you. You can reach us at <a href={`mailto:${settings.contactEmail}`} className="text-cyan-400 hover:text-cyan-300">{settings.contactEmail}</a> or use the form below.</p>
                )}
            </div>

            <div className="mt-12 bg-slate-800/50 p-8 rounded-xl border border-slate-700 max-w-2xl mx-auto">
                <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for your message!'); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-slate-300 mb-2">Full Name</label>
                            <input type="text" id="name" required className="w-full bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-slate-300 mb-2">Email Address</label>
                            <input type="email" id="email" required className="w-full bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                    </div>
                    <div className="mt-6">
                        <label htmlFor="message" className="block text-slate-300 mb-2">Message</label>
                        <textarea id="message" rows={5} required className="w-full bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none"></textarea>
                    </div>
                    <div className="mt-6 text-center">
                        <button type="submit" className="bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors">
                            Send Message
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;

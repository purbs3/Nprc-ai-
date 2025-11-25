import React, { useEffect } from 'react';
import { getSettings } from '../services/settingsService';

interface StaticPageProps {
    onGoBack: () => void;
}

const TermsPage: React.FC<StaticPageProps> = ({ onGoBack }) => {
    useEffect(() => {
        const loadSettings = async () => {
            const settings = await getSettings();
            document.title = `Terms of Service - ${settings.appName}`;
        };
        window.scrollTo(0, 0);
        loadSettings();
    }, []);

    return (
        <div className="container mx-auto px-6 py-16 max-w-4xl animate-fadeIn">
            <button onClick={onGoBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-semibold">
                &larr; Back to Home
            </button>
            <article className="prose prose-slate prose-invert lg:prose-xl mx-auto">
                <h1 className="!text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Terms of Service</h1>
                <p>Welcome to NPRC Physio. These terms and conditions outline the rules and regulations for the use of our website and AI assistant.</p>

                <h2>Medical Disclaimer</h2>
                <p>The information and advice provided by our AI assistant are for informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>

                <h2>Use of Service</h2>
                <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use NPRC Physio if you do not agree to all of the terms and conditions stated on this page.</p>
                <ul>
                    <li>You must be at least 18 years old to use our telehealth services.</li>
                    <li>You agree not to use the service for any unlawful purpose.</li>
                    <li>The AI assistant's responses are generated based on patterns in data and should not be considered infallible.</li>
                </ul>

                <h2>Intellectual Property</h2>
                <p>The content, organization, graphics, design, and other matters related to the Site are protected under applicable copyrights and other proprietary laws. The copying, redistribution, use or publication by you of any such matters or any part of the Site is strictly prohibited.</p>

                <h2>Changes to Terms</h2>
                <p>We reserve the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these terms of service.</p>
            </article>
        </div>
    );
};

export default TermsPage;

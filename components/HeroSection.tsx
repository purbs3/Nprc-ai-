import React from 'react';

interface HeroSectionProps {
    onNavigate: (path: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
    return (
        <section className="relative py-24 md:py-32 bg-slate-900 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-800/40 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <div className="container mx-auto px-6 relative z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 !leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                    Your Personal AI Physiotherapy Assistant
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 mb-8">
                    Get instant guidance on your muscle and joint concerns, receive personalized exercise suggestions, and access professional-grade analysis tools.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => onNavigate('/register')}
                        className="bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-transform hover:scale-105"
                    >
                        Get Started for Free
                    </button>
                    <a
                        href="#features"
                        className="bg-slate-800/50 border border-slate-700 text-slate-200 px-8 py-3 rounded-lg font-semibold hover:bg-slate-700/50 transition-colors"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
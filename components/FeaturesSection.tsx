import React from 'react';
import { FEATURES } from '../constants';

const FeaturesSection: React.FC = () => {
    return (
        <section id="features" className="py-24 bg-slate-900/50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">A Smarter Path to Recovery</h2>
                    <p className="text-slate-300 text-lg">
                        Leverage the power of AI to take control of your physical wellbeing, whether you're a patient or a clinician.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center transform transition-transform hover:-translate-y-2 hover:shadow-cyan-500/10">
                                <div className="bg-slate-700/50 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-6">
                                    <Icon className="h-8 w-8 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
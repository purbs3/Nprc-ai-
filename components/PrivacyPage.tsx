import React from 'react';
import { PRICING_PLANS } from '../constants';
import { CheckIcon } from './IconComponents';

interface PricingSectionProps {
    onNavigate: (path: string) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onNavigate }) => {
    return (
        <section id="pricing" className="py-24 bg-slate-900/50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Find the Perfect Plan</h2>
                    <p className="text-slate-300 text-lg">
                        Start for free and scale up as you need. All plans are designed to help you achieve your recovery goals.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PRICING_PLANS.map((plan) => (
                        <div key={plan.name} className={`bg-slate-800 p-8 rounded-xl border ${plan.popular ? 'border-cyan-500' : 'border-slate-700'} flex flex-col`}>
                            {plan.popular && (
                                <div className="text-center mb-4">
                                    <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                            <div className="text-center mb-8">
                                <span className="text-5xl font-extrabold">{plan.price}</span>
                                {plan.period && <span className="text-slate-400">{plan.period}</span>}
                            </div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center">
                                        <CheckIcon className="h-5 w-5 text-cyan-400 mr-3" />
                                        <span className="text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => onNavigate('/register')}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.popular
                                        ? 'bg-cyan-500 text-white hover:bg-cyan-400'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
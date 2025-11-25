import React, { useState, useEffect, useRef } from 'react';
import { PRICING_PLANS } from '../constants';
import { CheckIcon } from './IconComponents';

interface PricingSectionProps {
    onBookNow: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onBookNow }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = sectionRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <section
            id="pricing"
            ref={sectionRef}
            className={`py-24 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Flexible Plans for Your Needs</h2>
                    <p className="text-slate-300 text-lg">
                        Choose the right level of support, from free AI guidance to one-on-one sessions with our experts.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PRICING_PLANS.map((plan, index) => (
                        <div key={index} className={`bg-slate-800 p-8 rounded-xl border ${plan.isFeatured ? 'border-cyan-500 shadow-2xl shadow-cyan-500/10' : 'border-slate-700'} flex flex-col`}>
                            {plan.isFeatured && (
                                <div className="text-center mb-4">
                                    <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                            <p className="text-center text-slate-400 mb-6 h-12">{plan.description}</p>
                            <div className="text-center mb-8">
                                <span className="text-5xl font-extrabold">{plan.price}</span>
                                {plan.period && <span className="text-slate-400">{plan.period}</span>}
                            </div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start">
                                        <CheckIcon className="h-6 w-6 text-cyan-400 mr-3 flex-shrink-0" />
                                        <span className="text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onBookNow} className={`block text-center w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${plan.isFeatured ? 'bg-cyan-500 text-white hover:bg-cyan-400' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                                Book a Session
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;

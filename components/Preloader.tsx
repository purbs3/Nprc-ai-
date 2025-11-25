import React from 'react';
import { HealthIcon } from './IconComponents';

const Preloader: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
            <div className="flex items-center gap-4 animate-pulse">
                <HealthIcon className="h-12 w-12 text-cyan-400" />
                <span className="text-3xl font-bold text-white">NPRC Physio</span>
            </div>
            <p className="text-slate-400 mt-4">Loading your virtual assistant...</p>
        </div>
    );
};

export default Preloader;

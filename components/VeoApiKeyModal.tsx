import React from 'react';
import { XIcon, ShieldIcon } from './IconComponents';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKeySelected: () => void;
    featureName: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySelected, featureName }) => {
    if (!isOpen) {
        return null;
    }

    const handleSelectKey = async () => {
        if (window.aistudio) {
            try {
                await window.aistudio.openSelectKey();
                // Assume key selection was successful as per guidelines
                onKeySelected();
            } catch (error) {
                console.error("Error opening API key selection:", error);
                // Handle cases where the dialog might fail to open
            } finally {
                onClose();
            }
        } else {
            alert("API key selection is not available.");
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            aria-labelledby="api-key-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md m-4 relative p-8 text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-300"
                    aria-label="Close modal"
                >
                    <XIcon className="h-6 w-6" />
                </button>

                <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-cyan-500/20">
                    <ShieldIcon className="h-6 w-6 text-cyan-400" />
                </div>

                <h2 id="api-key-modal-title" className="text-2xl font-bold text-white mb-2">API Key Required</h2>
                <p className="text-slate-300 mb-6">
                    To use the {featureName.toLowerCase()} feature, please select your Google AI API key to continue.
                </p>

                <button
                    onClick={handleSelectKey}
                    className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors duration-300 mb-4"
                >
                    Select API Key & Continue
                </button>

                <p className="text-xs text-slate-400">
                    This is a one-time setup for your session. Charges may apply for usage. For pricing details, please see the{' '}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 underline hover:text-cyan-300"
                    >
                        official billing documentation
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyModal;
import React, { useState, FormEvent, useEffect } from 'react';
import { XIcon } from './IconComponents';
import { addFeedback } from '../services/feedbackService';
import type { Feedback } from '../types';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState<Feedback['rating'] | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Reset form when modal is reopened
        if (isOpen) {
            setRating(null);
            setComment('');
            setIsSubmitted(false);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!rating) {
            alert('Please select a rating.');
            return;
        }

        setIsSubmitting(true);
        await addFeedback({ rating, comment });
        setIsSubmitting(false);

        setIsSubmitted(true);

        setTimeout(() => {
            onClose();
        }, 2000); // Close modal after 2 seconds
    };

    const ratingOptions: Feedback['rating'][] = ['Helpful', 'Neutral', 'Unhelpful'];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            aria-labelledby="feedback-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md m-4 relative p-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-300"
                    aria-label="Close feedback modal"
                >
                    <XIcon className="h-6 w-6" />
                </button>

                {isSubmitted ? (
                    <div className="text-center">
                        <h2 id="feedback-modal-title" className="text-2xl font-bold text-white mb-2">Thank you!</h2>
                        <p className="text-slate-300">Your feedback has been submitted.</p>
                    </div>
                ) : (
                    <>
                        <h2 id="feedback-modal-title" className="text-2xl font-bold text-white mb-4">Share Your Feedback</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <p className="text-slate-300 mb-3">How was your experience?</p>
                                <div className="flex justify-center gap-2">
                                    {ratingOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setRating(option)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border-2 ${rating === option
                                                    ? 'bg-cyan-500 border-cyan-500 text-white'
                                                    : 'bg-slate-700 border-slate-600 text-slate-200 hover:border-cyan-500'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="comment" className="block text-slate-300 mb-2">
                                    Additional comments (optional)
                                </label>
                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                                    placeholder="Tell us more..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                                disabled={!rating || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;

import React, { useState, useEffect } from 'react';
import type { Feedback } from '../types';
import { getFeedback } from '../services/feedbackService';

const FeedbackManagement: React.FC = () => {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFeedback = async () => {
            setIsLoading(true);
            const fetchedFeedback = await getFeedback();
            setFeedbackList(fetchedFeedback);
            setIsLoading(false);
        };
        loadFeedback();
    }, []);

    const ratingColor = (rating: Feedback['rating']) => {
        switch (rating) {
            case 'Helpful': return 'bg-green-500/20 text-green-300';
            case 'Neutral': return 'bg-yellow-500/20 text-yellow-300';
            case 'Unhelpful': return 'bg-red-500/20 text-red-300';
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <h1 className="text-2xl font-bold mb-6">User Feedback</h1>
            <div className="space-y-4">
                {isLoading ? (
                    <p className="text-slate-400 text-center py-4">Loading feedback...</p>
                ) : feedbackList.length > 0 ? (
                    feedbackList.map(feedback => (
                        <div key={feedback.id} className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ratingColor(feedback.rating)}`}>
                                        {feedback.rating}
                                    </span>
                                    <p className="text-sm text-slate-400 mt-2">
                                        Submitted on: {formatDate(feedback.submittedAt)}
                                    </p>
                                </div>
                            </div>
                            {feedback.comment && (
                                <p className="mt-3 text-slate-300 bg-slate-900/40 p-3 rounded-md">{feedback.comment}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400 text-center py-4">No feedback has been submitted yet.</p>
                )}
            </div>
        </div>
    );
};

export default FeedbackManagement;

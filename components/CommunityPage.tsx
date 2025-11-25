import React, { useState, useEffect } from 'react';
import { getForumCategories, getCategoryStats } from '../services/forumService';
import type { ForumCategory } from '../types';
import { UsersIcon } from './IconComponents';
import { getSettings } from '../services/settingsService';

interface CommunityPageProps {
    onNavigate: (path: string) => void;
    onGoBack: () => void;
}

// FIX: Changed to a type intersection to fix property access errors.
type CategoryWithStats = ForumCategory & {
    topicCount: number;
    postCount: number;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigate, onGoBack }) => {
    const [categories, setCategories] = useState<CategoryWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const settings = await getSettings();
            document.title = `Community Forum - ${settings.appName}`;

            const fetchedCategories = await getForumCategories();
            const categoriesWithStats = await Promise.all(
                fetchedCategories.map(async (category) => {
                    const stats = await getCategoryStats(category.id);
                    return { ...category, ...stats };
                })
            );

            setCategories(categoriesWithStats);
            setIsLoading(false);
        };
        loadData();
    }, []);

    return (
        <section id="community-page" className="py-24 bg-slate-900 animate-fadeIn">
            <div className="container mx-auto px-6">
                <button onClick={onGoBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-semibold">
                    &larr; Back to Home
                </button>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 !text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                        Professional Community Forum
                    </h1>
                    <p className="text-slate-300 text-lg">
                        A dedicated space for physiotherapists and medical professionals to connect, discuss, and share knowledge.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto space-y-6">
                    {isLoading ? (
                        <p className="text-slate-400 text-center">Loading categories...</p>
                    ) : categories.length > 0 ? (
                        categories.map(category => (
                            <div key={category.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <button onClick={() => onNavigate(`/community/${category.slug}`)} className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                                            {category.name}
                                        </button>
                                        <p className="text-slate-400 mt-1">{category.description}</p>
                                    </div>
                                    <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-6 text-left sm:text-right">
                                        <p className="text-sm text-slate-300">{category.topicCount} Topics</p>
                                        <p className="text-sm text-slate-400">{category.postCount} Posts</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center">No forum categories have been created yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CommunityPage;

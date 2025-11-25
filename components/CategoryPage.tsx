import React, { useState, useEffect, FormEvent } from 'react';
import { getCategoryBySlug, getTopicsForCategory, createTopic, getTopicStats } from '../services/forumService';
import type { ForumCategory, ForumTopic, ForumPost } from '../types';
import RichTextEditor from './RichTextEditor';
import { getSettings } from '../services/settingsService';
import LoadingSpinner from './LoadingSpinner';

interface CategoryPageProps {
    categorySlug: string;
    onNavigate: (path: string) => void;
}

// FIX: Changed to a type intersection to fix property access errors.
type TopicWithStats = ForumTopic & {
    replyCount: number;
    lastPost: ForumPost | null;
};

const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, onNavigate }) => {
    const [category, setCategory] = useState<ForumCategory | null>(null);
    const [topics, setTopics] = useState<TopicWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicContent, setNewTopicContent] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const settings = await getSettings();
            const foundCategory = await getCategoryBySlug(categorySlug);

            if (foundCategory) {
                setCategory(foundCategory);
                document.title = `${foundCategory.name} - ${settings.appName} Forum`;

                const fetchedTopics = await getTopicsForCategory(foundCategory.id);
                const topicsWithStats = await Promise.all(
                    fetchedTopics.map(async (topic) => {
                        const stats = await getTopicStats(topic.id);
                        return { ...topic, ...stats };
                    })
                );
                setTopics(topicsWithStats);
            } else {
                setCategory(null);
                setTopics([]);
            }

            setIsLoading(false);
            setIsFormVisible(false); // Reset form visibility on slug change
        };
        loadData();
    }, [categorySlug]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!category || !newTopicTitle.trim() || !newTopicContent.trim()) return;

        // In a real app, author would come from authenticated user data
        const newTopic = await createTopic({
            categoryId: category.id,
            title: newTopicTitle,
            content: newTopicContent,
            authorName: 'Dr. Purab Sinha', // Placeholder
            authorTitle: 'Lead Physiotherapist, DPT', // Placeholder
        });

        const newTopicWithStats: TopicWithStats = {
            ...newTopic,
            replyCount: 0,
            lastPost: null,
        };

        setTopics([newTopicWithStats, ...topics]);
        setIsFormVisible(false);
        setNewTopicTitle('');
        setNewTopicContent('');
    };

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (isLoading) {
        return <div className="text-center py-24"><LoadingSpinner /></div>;
    }

    if (!category) {
        return <div className="text-center py-24 text-slate-400">Category not found.</div>;
    }

    return (
        <section id="category-page" className="py-24 bg-slate-900 animate-fadeIn">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="mb-8 text-sm text-slate-400">
                    <button onClick={() => onNavigate('/')} className="hover:text-cyan-400">Home</button>
                    <span className="mx-2">&gt;</span>
                    <button onClick={() => onNavigate('/community')} className="hover:text-cyan-400">Community</button>
                </div>

                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
                        <p className="text-slate-400 mt-1">{category.description}</p>
                    </div>
                    <button onClick={() => setIsFormVisible(!isFormVisible)} className="mt-4 md:mt-0 flex-shrink-0 bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-400 transition-colors font-semibold">
                        {isFormVisible ? 'Cancel' : 'Create New Topic'}
                    </button>
                </div>

                {isFormVisible && (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8 animate-fadeIn">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h2 className="text-xl font-bold">Create a new topic</h2>
                            <div>
                                <label htmlFor="topic-title" className="block text-slate-300 mb-1">Topic Title</label>
                                <input id="topic-title" type="text" value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                            <div>
                                <label htmlFor="topic-content" className="block text-slate-300 mb-1">Content</label>
                                <RichTextEditor value={newTopicContent} onChange={setNewTopicContent} />
                            </div>
                            <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">Submit Topic</button>
                        </form>
                    </div>
                )}

                <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-700 text-slate-400 font-bold text-sm uppercase tracking-wider">
                        <div className="col-span-7">Topic</div>
                        <div className="col-span-1 text-center">Replies</div>
                        <div className="col-span-4">Last Post</div>
                    </div>

                    {topics.length > 0 ? (
                        topics.map(topic => (
                            <div key={topic.id} className="grid grid-cols-12 gap-x-4 gap-y-2 p-4 border-b border-slate-700 last:border-b-0 items-center hover:bg-slate-800 transition-colors">
                                {/* Topic Title & Author */}
                                <div className="col-span-12 md:col-span-7">
                                    <button onClick={() => onNavigate(`/community/${category.slug}/${topic.id}`)} className="text-lg font-semibold text-cyan-400 hover:text-cyan-300 text-left leading-tight">
                                        {topic.title}
                                    </button>
                                    <p className="text-xs text-slate-400 mt-1">
                                        By {topic.authorName}
                                    </p>
                                </div>

                                {/* Replies */}
                                <div className="col-span-6 md:col-span-1 text-left md:text-center">
                                    <span className="md:hidden text-xs text-slate-400 mr-2">Replies:</span>
                                    <span className="font-bold text-lg">{topic.replyCount}</span>
                                </div>

                                {/* Last Post */}
                                <div className="col-span-6 md:col-span-4 text-left md:text-left text-xs text-slate-400">
                                    {topic.lastPost ? (
                                        <div>
                                            <p className="truncate">by {topic.lastPost.authorName}</p>
                                            <p>{timeSince(topic.lastPost.createdAt)}</p>
                                        </div>
                                    ) : (
                                        <p>No replies yet</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-300">No topics in this category yet.</p>
                            <p className="text-slate-400 mt-2">Be the first to start a discussion!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategoryPage;

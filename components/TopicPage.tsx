import React, { useState, useEffect, FormEvent } from 'react';
import { getCategoryBySlug, getTopicById, getPostsForTopic, createPost } from '../services/forumService';
import type { ForumCategory, ForumTopic, ForumPost } from '../types';
import RichTextEditor from './RichTextEditor';
import { getSettings } from '../services/settingsService';
import LoadingSpinner from './LoadingSpinner';

interface TopicPageProps {
    categorySlug: string;
    topicId: string;
    onNavigate: (path: string) => void;
}

const TopicPage: React.FC<TopicPageProps> = ({ categorySlug, topicId, onNavigate }) => {
    const [category, setCategory] = useState<ForumCategory | null>(null);
    const [topic, setTopic] = useState<ForumTopic | null>(null);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const settings = await getSettings();
            const foundCategory = await getCategoryBySlug(categorySlug);
            const foundTopic = await getTopicById(topicId);

            setCategory(foundCategory || null);
            setTopic(foundTopic || null);

            if (foundTopic) {
                const fetchedPosts = await getPostsForTopic(foundTopic.id);
                setPosts(fetchedPosts);
                document.title = `${foundTopic.title} - ${settings.appName} Forum`;
            }
            setIsLoading(false);
        };
        loadData();
    }, [categorySlug, topicId]);

    const handleSubmitReply = async (e: FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !topic) return;

        setIsSubmitting(true);
        // In a real app, author would come from authenticated user data
        const newPost = await createPost({
            topicId: topic.id,
            content: replyContent,
            authorName: 'Dr. Tarique Akhtar', // Placeholder for another user
            authorTitle: 'Senior Physiotherapist, MSc', // Placeholder
        });

        setPosts([...posts, newPost]);
        setReplyContent('');
        setIsSubmitting(false);
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    if (isLoading) {
        return <div className="text-center py-24"><LoadingSpinner /></div>;
    }

    if (!topic || !category) {
        return <div className="text-center py-24 text-slate-400">Topic not found.</div>;
    }

    return (
        <section id="topic-page" className="py-24 bg-slate-900 animate-fadeIn">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="mb-8 text-sm text-slate-400">
                    <button onClick={() => onNavigate('/')} className="hover:text-cyan-400">Home</button>
                    <span className="mx-2">&gt;</span>
                    <button onClick={() => onNavigate('/community')} className="hover:text-cyan-400">Community</button>
                    <span className="mx-2">&gt;</span>
                    <button onClick={() => onNavigate(`/community/${category.slug}`)} className="hover:text-cyan-400">{category.name}</button>
                </div>

                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold !text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">{topic.title}</h1>
                </header>

                <div className="space-y-6">
                    {/* Original Post */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xl text-cyan-400 mx-auto">
                                {topic.authorName.charAt(0)}
                            </div>
                            <p className="font-bold text-white mt-2 text-sm">{topic.authorName}</p>
                            <p className="text-slate-400 text-xs">{topic.authorTitle}</p>
                        </div>
                        <div className="flex-1 bg-slate-800 p-6 rounded-xl border border-cyan-500/30">
                            <p className="text-xs text-slate-400 mb-4">Posted on {formatDate(topic.createdAt)}</p>
                            <div className="prose prose-slate prose-invert" dangerouslySetInnerHTML={{ __html: topic.content }} />
                        </div>
                    </div>

                    {/* Replies */}
                    {posts.map(post => (
                        <div key={post.id} className="flex gap-4">
                            <div className="flex-shrink-0 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xl text-white mx-auto">
                                    {post.authorName.charAt(0)}
                                </div>
                                <p className="font-bold text-white mt-2 text-sm">{post.authorName}</p>
                                <p className="text-slate-400 text-xs">{post.authorTitle}</p>
                            </div>
                            <div className="flex-1 bg-slate-800/70 p-6 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-400 mb-4">Posted on {formatDate(post.createdAt)}</p>
                                <div className="prose prose-slate prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Form */}
                <div className="mt-12 pt-8 border-t border-slate-700">
                    <h2 className="text-2xl font-bold mb-4">Post a Reply</h2>
                    <form onSubmit={handleSubmitReply} className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div>
                            <RichTextEditor value={replyContent} onChange={setReplyContent} />
                        </div>
                        <button type="submit" disabled={isSubmitting || !replyContent.trim()} className="bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-400 transition-colors font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default TopicPage;

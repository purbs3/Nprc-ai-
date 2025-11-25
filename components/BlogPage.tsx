import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../services/blogService';
import type { BlogPost } from '../types';
import { stripHtml } from '../utils/html';

interface BlogPageProps {
    onSelectPost: (postSlug: string) => void;
    onGoBack: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onSelectPost, onGoBack }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const loadPosts = async () => {
            const fetchedPosts = await getBlogPosts();
            setPosts(fetchedPosts);
        };
        loadPosts();
    }, []);

    return (
        <section id="blog-page" className="py-24 bg-slate-900">
            <div className="container mx-auto px-6">
                <button onClick={onGoBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-semibold">
                    &larr; Back to Home
                </button>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">From Our Blog</h1>
                    <p className="text-slate-300 text-lg">
                        The latest insights, tips, and articles from the NPRC Physio team.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto space-y-12">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <article key={post.id} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 flex flex-col transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10">
                                <h2 className="text-2xl font-bold mb-2 text-cyan-400">{post.title}</h2>
                                <p className="text-sm text-slate-400 mb-4">By {post.author} on {post.date}</p>
                                <p className="text-slate-300 flex-grow mb-6">
                                    {stripHtml(post.content).substring(0, 250)}{stripHtml(post.content).length > 250 ? '...' : ''}
                                </p>
                                <button onClick={() => onSelectPost(post.slug)} className="font-semibold text-white hover:text-cyan-400 transition-colors self-start">
                                    Read More &rarr;
                                </button>
                            </article>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center">No blog posts have been published yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BlogPage;

import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../services/blogService';
import type { BlogPost } from '../types';
import { stripHtml } from '../utils/html';

interface BlogSectionProps {
    onNavigate: (path: string) => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({ onNavigate }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const loadPosts = async () => {
            const fetchedPosts = await getBlogPosts();
            setPosts(fetchedPosts.slice(0, 3)); // Get latest 3 posts
        };
        loadPosts();
    }, []);

    return (
        <section id="blog" className="py-24 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">From Our Blog</h2>
                    <p className="text-slate-300 text-lg">
                        The latest insights, tips, and articles from the NPRC Physio team.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10">
                                <h3 className="text-xl font-bold mb-2 text-cyan-400">{post.title}</h3>
                                <p className="text-sm text-slate-400 mb-4">By {post.author} on {post.date}</p>
                                <p className="text-slate-300 flex-grow mb-6">
                                    {stripHtml(post.content).substring(0, 120)}...
                                </p>
                                <button onClick={() => onNavigate(`/blog/${post.slug}`)} className="font-semibold text-white hover:text-cyan-400 transition-colors self-start">
                                    Read More &rarr;
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center md:col-span-3">No blog posts have been published yet.</p>
                    )}
                </div>
                <div className="text-center mt-12">
                    <button onClick={() => onNavigate('/blog')} className="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors">
                        View All Posts
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
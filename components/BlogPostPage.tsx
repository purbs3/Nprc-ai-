import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../services/blogService';
import type { BlogPost } from '../types';

interface BlogPostPageProps {
    postSlug: string;
    onGoBack: () => void;
}

// Helper to set or create a meta tag
const setMetaTag = (name: string, content: string) => {
    let element = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
    if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
    }
    element.content = content;
};

const BlogPostPage: React.FC<BlogPostPageProps> = ({ postSlug, onGoBack }) => {
    const [post, setPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const loadPost = async () => {
            const posts = await getBlogPosts();
            const foundPost = posts.find(p => p.slug === postSlug);
            setPost(foundPost || null);

            if (foundPost) {
                document.title = foundPost.metaTitle || foundPost.title;
                setMetaTag('description', foundPost.metaDescription);
                setMetaTag('keywords', foundPost.metaKeywords);
            }
        };

        // Store original meta tags
        const originalTitle = document.title;
        const originalDescription = document.querySelector("meta[name='description']")?.getAttribute('content') || '';
        const originalKeywords = document.querySelector("meta[name='keywords']")?.getAttribute('content') || '';

        loadPost();

        // Cleanup function to restore original meta tags on component unmount
        return () => {
            document.title = originalTitle;
            setMetaTag('description', originalDescription);
            setMetaTag('keywords', originalKeywords);
        };
    }, [postSlug]);

    if (!post) {
        return (
            <div className="container mx-auto px-6 py-16 text-center min-h-screen">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <button onClick={onGoBack} className="mt-4 text-cyan-400 hover:text-cyan-300">
                    &larr; Back to Blog
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-16 max-w-4xl">
            <button onClick={onGoBack} className="mb-8 text-cyan-400 hover:text-cyan-300 font-semibold">
                &larr; Back to Blog
            </button>
            <article className="prose prose-slate prose-invert lg:prose-xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold !text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-4">
                    {post.title}
                </h1>
                <p className="text-slate-400">
                    By {post.author} on {post.date}
                </p>
                <div
                    className="mt-8"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </div>
    );
};

export default BlogPostPage;

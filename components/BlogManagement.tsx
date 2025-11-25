import React, { useState, useEffect, FormEvent } from 'react';
import type { BlogPost } from '../types';
import { getBlogPosts, saveBlogPosts } from '../services/blogService';
import RichTextEditor from './RichTextEditor';
import { generateMetaDescription } from '../services/geminiService';
import { SparklesIcon } from './IconComponents';

// Helper to generate a URL-friendly slug from a string
const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};


const BlogManagement: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [slug, setSlug] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');
    const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);


    useEffect(() => {
        const loadPosts = async () => {
            setIsLoading(true);
            const fetchedPosts = await getBlogPosts();
            setPosts(fetchedPosts);
            setIsLoading(false);
        };
        loadPosts();
    }, []);

    const handleSaveChanges = async (updatedPosts: BlogPost[]) => {
        setPosts(updatedPosts);
        await saveBlogPosts(updatedPosts);
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setAuthor('');
        setSlug('');
        setMetaTitle('');
        setMetaDescription('');
        setMetaKeywords('');
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setTitle(post.title);
        setContent(post.content);
        setAuthor(post.author);
        setSlug(post.slug);
        setMetaTitle(post.metaTitle);
        setMetaDescription(post.metaDescription);
        setMetaKeywords(post.metaKeywords);
        setIsFormVisible(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const updatedPosts = posts.filter(p => p.id !== id);
            await handleSaveChanges(updatedPosts);
        }
    };

    const handleAddNew = () => {
        setEditingPost(null);
        resetForm();
        setIsFormVisible(true);
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingPost(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const postData = {
            title,
            content,
            author,
            slug: slug || generateSlug(title), // Auto-generate slug if empty
            metaTitle: metaTitle || title, // Default meta title to post title
            metaDescription,
            metaKeywords,
        };

        let updatedPosts;
        if (editingPost) {
            // Update existing post
            updatedPosts = posts.map(p => p.id === editingPost.id ? { ...p, ...postData } : p);
        } else {
            // Create new post
            const newPost: BlogPost = {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                ...postData
            };
            updatedPosts = [newPost, ...posts];
        }
        await handleSaveChanges(updatedPosts);
        setIsFormVisible(false);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Only auto-update slug if it's a new post
        if (!editingPost) {
            setSlug(generateSlug(newTitle));
        }
    };

    const handleGenerateMeta = async () => {
        if (!content) {
            alert("Please add some content to the blog post before generating SEO meta tags.");
            return;
        }
        setIsGeneratingMeta(true);
        try {
            const result = await generateMetaDescription(content);
            setMetaDescription(result.description);
            setMetaKeywords(result.keywords);
        } catch (error) {
            console.error("Failed to generate meta description:", error);
            alert("An error occurred while generating meta tags. Please try again.");
        } finally {
            setIsGeneratingMeta(false);
        }
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Blog Management</h1>
                {!isFormVisible && (
                    <button onClick={handleAddNew} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                        Add New Post
                    </button>
                )}
            </div>

            {isFormVisible ? (
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                    <div>
                        <label htmlFor="title" className="block text-slate-300 mb-1">Title</label>
                        <input id="title" type="text" value={title} onChange={handleTitleChange} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="slug" className="block text-slate-300 mb-1">Slug (URL)</label>
                        <input id="slug" type="text" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="author" className="block text-slate-300 mb-1">Author</label>
                        <input id="author" type="text" value={author} onChange={e => setAuthor(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-slate-300 mb-1">Content</label>
                        <RichTextEditor value={content} onChange={setContent} />
                    </div>

                    <h3 className="text-lg font-semibold pt-4 border-t border-slate-600">SEO Settings</h3>
                    <div>
                        <label htmlFor="metaTitle" className="block text-slate-300 mb-1">Meta Title</label>
                        <input id="metaTitle" type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Defaults to post title" className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="metaDescription" className="block text-slate-300">Meta Description</label>
                            <button
                                type="button"
                                onClick={handleGenerateMeta}
                                disabled={isGeneratingMeta || !content}
                                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Generate with AI"
                            >
                                <SparklesIcon className={`h-4 w-4 ${isGeneratingMeta ? 'animate-spin' : ''}`} />
                                {isGeneratingMeta ? 'Generating...' : 'Auto-generate'}
                            </button>
                        </div>
                        <textarea id="metaDescription" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="metaKeywords" className="block text-slate-300 mb-1">Meta Keywords (comma-separated)</label>
                        <input id="metaKeywords" type="text" value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)} className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                            {editingPost ? 'Update Post' : 'Save Post'}
                        </button>
                        <button type="button" onClick={handleCancel} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-slate-400 text-center py-4">Loading posts...</p>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{post.title}</h3>
                                    <p className="text-sm text-slate-400">By {post.author} on {post.date}</p>
                                    <p className="text-xs text-slate-500 mt-1">/{post.slug}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => handleEdit(post)} className="font-semibold text-cyan-400 hover:text-cyan-300">Edit</button>
                                    <button onClick={() => handleDelete(post.id)} className="font-semibold text-red-400 hover:text-red-300">Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center py-4">No blog posts found. Click "Add New Post" to get started.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogManagement;

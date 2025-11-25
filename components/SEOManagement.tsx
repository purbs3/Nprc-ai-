import React, { useState, useEffect } from 'react';
import type { BlogPost } from '../types';
import { getBlogPosts, saveBlogPosts } from '../services/blogService';
import { generateMetaDescription } from '../services/geminiService';
import { SparklesIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

// FIX: Changed to a type intersection to fix property access errors.
type AnalyzedPost = BlogPost & {
    suggestion?: {
        description: string;
        keywords: string;
    };
    isAnalyzing?: boolean;
    isApplying?: boolean;
};

const SEOManagement: React.FC = () => {
    const [analyzedPosts, setAnalyzedPosts] = useState<AnalyzedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

    useEffect(() => {
        const loadPosts = async () => {
            setIsLoading(true);
            const fetchedPosts = await getBlogPosts();
            setAnalyzedPosts(fetchedPosts.map(p => ({ ...p })));
            setIsLoading(false);
        };
        loadPosts();
    }, []);

    const performAnalysis = async (postId: string) => {
        setAnalyzedPosts(prev => prev.map(p => p.id === postId ? { ...p, isAnalyzing: true, suggestion: undefined } : p));

        const post = analyzedPosts.find(p => p.id === postId);
        if (!post || !post.content) {
            console.error("Post not found or has no content");
            setAnalyzedPosts(prev => prev.map(p => p.id === postId ? { ...p, isAnalyzing: false } : p));
            return;
        }

        try {
            const result = await generateMetaDescription(post.content);
            setAnalyzedPosts(prev => prev.map(p => p.id === postId ? { ...p, isAnalyzing: false, suggestion: result } : p));
        } catch (error: any) {
            console.error("Error generating meta for post", postId, error);
            alert(`Could not generate SEO data for "${post.title}". The AI service may be unavailable.`);
            setAnalyzedPosts(prev => prev.map(p => p.id === postId ? { ...p, isAnalyzing: false } : p));
        }
    };

    const handleAnalyze = async (postId: string) => {
        await performAnalysis(postId);
    }

    const handleAnalyzeAll = async () => {
        setIsAnalyzingAll(true);
        // Using a for...of loop to handle sequential analysis
        for (const post of analyzedPosts) {
            await performAnalysis(post.id);
        }
        setIsAnalyzingAll(false);
    };

    const handleApply = async (postId: string) => {
        const postToUpdate = analyzedPosts.find(p => p.id === postId);
        if (!postToUpdate || !postToUpdate.suggestion) return;

        setAnalyzedPosts(prev => prev.map(p => p.id === postId ? { ...p, isApplying: true } : p));

        const updatedPosts = analyzedPosts.map(p => {
            if (p.id === postId && p.suggestion) {
                return {
                    ...p,
                    metaDescription: p.suggestion.description,
                    metaKeywords: p.suggestion.keywords,
                    suggestion: undefined,
                };
            }
            return p;
        });

        const postsToSave: BlogPost[] = updatedPosts.map(({ suggestion, isAnalyzing, isApplying, ...rest }) => rest);

        await saveBlogPosts(postsToSave);
        setAnalyzedPosts(updatedPosts.map(p => ({ ...p, isApplying: false })));
    };

    const MetaDisplay: React.FC<{ title: string; description: string; keywords: string; }> = ({ title, description, keywords }) => (
        <div className="space-y-2 text-sm">
            <p><strong className="text-slate-300">Title:</strong> {title || '(Not set)'}</p>
            <p><strong className="text-slate-300">Description:</strong> {description || '(Not set)'}</p>
            <p><strong className="text-slate-300">Keywords:</strong> {keywords || '(Not set)'}</p>
        </div>
    );

    return (
        <>
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Blog SEO Analysis</h1>
                        <p className="text-slate-400 mt-1">Use AI to generate and improve SEO metadata for your blog posts.</p>
                    </div>
                    <button
                        onClick={handleAnalyzeAll}
                        disabled={isAnalyzingAll || isLoading}
                        className="flex items-center justify-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 disabled:bg-slate-600 transition-colors"
                    >
                        <SparklesIcon className={`h-5 w-5 ${isAnalyzingAll ? 'animate-spin' : ''}`} />
                        {isAnalyzingAll ? 'Analyzing All...' : 'Analyze All Posts'}
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-8"><LoadingSpinner /></div>
                ) : (
                    <div className="space-y-6">
                        {analyzedPosts.map(post => (
                            <div key={post.id} className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                <h2 className="text-lg font-bold text-cyan-400 mb-4">{post.title}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Current SEO */}
                                    <div>
                                        <h3 className="font-semibold text-white mb-2">Current SEO</h3>
                                        <div className="bg-slate-800/50 p-4 rounded">
                                            <MetaDisplay
                                                title={post.metaTitle}
                                                description={post.metaDescription}
                                                keywords={post.metaKeywords}
                                            />
                                        </div>
                                    </div>
                                    {/* AI Suggestion */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold text-white">AI Suggestion</h3>
                                            <button
                                                onClick={() => handleAnalyze(post.id)}
                                                disabled={post.isAnalyzing || isAnalyzingAll}
                                                className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                                            >
                                                <SparklesIcon className={`h-4 w-4 ${post.isAnalyzing ? 'animate-spin' : ''}`} />
                                                {post.isAnalyzing ? 'Generating...' : 'Regenerate'}
                                            </button>
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded min-h-[116px] flex flex-col justify-center">
                                            {post.isAnalyzing ? (
                                                <LoadingSpinner />
                                            ) : post.suggestion ? (
                                                <>
                                                    <MetaDisplay
                                                        title={post.metaTitle || post.title}
                                                        description={post.suggestion.description}
                                                        keywords={post.suggestion.keywords}
                                                    />
                                                    <button
                                                        onClick={() => handleApply(post.id)}
                                                        disabled={post.isApplying}
                                                        className="mt-4 w-full bg-cyan-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-cyan-500 disabled:bg-slate-600"
                                                    >
                                                        {post.isApplying ? 'Applying...' : 'Apply Suggestions'}
                                                    </button>
                                                </>
                                            ) : (
                                                <p className="text-slate-400 text-sm text-center">Click "Regenerate" to get AI suggestions.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default SEOManagement;

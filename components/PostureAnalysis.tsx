import React, { useState, useRef } from 'react';
import { ImageIcon, XCircleIcon } from './IconComponents';
import { fileToBase64 } from '../utils/image';
import { analyzePostureForClinician } from '../services/geminiService';

const PostureAnalysis: React.FC = () => {
    const [image, setImage] = useState<{ file: File; previewUrl: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage({ file, previewUrl: URL.createObjectURL(file) });
            setResult('');
            setError('');
        }
        event.target.value = '';
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setIsLoading(true);
        setResult('');
        setError('');

        try {
            const base64Data = await fileToBase64(image.file);
            const stream = await analyzePostureForClinician(base64Data, image.file.type);

            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setResult(fullResponse);
            }
        } catch (err: any) {
            setError('An error occurred during analysis. The AI service may be unavailable.');
            console.error('Analysis error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const createMarkup = (text: string) => {
        return { __html: text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') };
    };

    return (
        <>
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4">Posture Analysis Tool</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: Image Upload */}
                    <div>
                        <div
                            className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            <ImageIcon className="h-12 w-12 mx-auto text-slate-400" />
                            <p className="mt-2 text-slate-300">
                                {image ? 'Click to change image' : 'Click to upload an image'}
                            </p>
                            <p className="text-xs text-slate-500">Side profile or front view recommended</p>
                        </div>

                        {image && (
                            <div className="mt-4 relative">
                                <h3 className="font-semibold mb-2">Image Preview:</h3>
                                <img src={image.previewUrl} alt="Posture preview" className="w-full rounded-lg" />
                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full p-0.5 hover:bg-slate-500"
                                    aria-label="Remove image"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={!image || isLoading}
                            className="w-full mt-6 bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Posture'}
                        </button>
                    </div>

                    {/* Right side: Result */}
                    <div>
                        <h3 className="font-semibold mb-2 text-lg">AI Analysis Report</h3>
                        <div className="bg-slate-900/50 p-4 rounded-lg min-h-[400px] border border-slate-700">
                            {isLoading && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                                </div>
                            )}
                            {error && <p className="text-red-400">{error}</p>}
                            {result && (
                                <div
                                    className="prose prose-slate prose-invert"
                                    dangerouslySetInnerHTML={createMarkup(result)}
                                />
                            )}
                            {!isLoading && !result && !error && (
                                <p className="text-slate-400 text-center pt-16">Upload an image and click "Analyze Posture" to see the report here.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostureAnalysis;
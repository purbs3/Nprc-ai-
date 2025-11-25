import React, { useState, useRef } from 'react';
import { ImageIcon, XCircleIcon, SparklesIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

const GaitAnalysis: React.FC = () => {
    const [video, setVideo] = useState<{ file: File; previewUrl: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisType, setAnalysisType] = useState<'mediapipe' | 'opencap' | 'pro' | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setVideo({ file, previewUrl: URL.createObjectURL(file) });
            setResult(null);
            setAnalysisType(null);
        } else {
            alert('Please select a valid video file.');
        }
        event.target.value = '';
    };

    const handleAnalyze = (type: 'mediapipe' | 'opencap' | 'pro') => {
        if (!video) return;

        setIsLoading(true);
        setAnalysisType(type);
        setResult(null);

        // Simulate API call and analysis
        const delay = type === 'opencap' ? 3000 : 1500;
        setTimeout(() => {
            let analysisResult = '';
            if (type === 'mediapipe') {
                analysisResult = `
                    <h3 class="text-lg font-bold text-cyan-400 mb-2">MediaPipe Real-Time Analysis</h3>
                    <p><strong>Status:</strong> Analysis Complete</p>
                    <p><strong>Key Observations:</strong></p>
                    <ul class="list-disc list-inside mt-2">
                        <li>Slight pelvic drop on the right side during mid-stance.</li>
                        <li>Reduced knee flexion during the swing phase of the left leg.</li>
                        <li>Forward head posture observed throughout the gait cycle.</li>
                    </ul>
                    <p class="mt-4 text-xs text-slate-400"><em>This is a quick, simulated analysis for in-session feedback.</em></p>
                `;
            } else if (type === 'opencap') {
                analysisResult = `
                    <h3 class="text-lg font-bold text-cyan-400 mb-2">OpenCap API - Detailed Gait Metrics</h3>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        <p><strong>Cadence:</strong></p><p>115 steps/min</p>
                        <p><strong>Walking Speed:</strong></p><p>1.2 m/s</p>
                        <p><strong>Step Length (Avg):</strong></p><p>0.70 m</p>
                        <p><strong>Stride Time (Avg):</strong></p><p>1.04 s</p>
                        <p><strong>Left Stance Phase:</strong></p><p>61%</p>
                        <p><strong>Right Stance Phase:</strong></p><p>63% (Asymmetry noted)</p>
                        <p><strong>Peak Knee Flexion (L):</strong></p><p>55 degrees</p>
                        <p><strong>Peak Knee Flexion (R):</strong></p><p>58 degrees</p>
                    </div>
                     <p class="mt-4 text-xs text-slate-400"><em>Simulated in-depth metrics from the OpenCap API.</em></p>
                `;
            } else { // Pro Workflow
                analysisResult = `
                    <h3 class="text-lg font-bold text-cyan-400 mb-2">Pro Workflow: Combined Analysis</h3>
                    <p class="text-sm font-semibold mt-4">Real-Time Feedback (MediaPipe)</p>
                    <ul class="list-disc list-inside mt-1 text-sm">
                        <li>Slight pelvic drop on the right side during mid-stance.</li>
                        <li>Reduced knee flexion during the swing phase of the left leg.</li>
                    </ul>
                    <p class="text-sm font-semibold mt-4">Detailed Metrics (OpenCap)</p>
                     <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm">
                        <p><strong>Cadence:</strong></p><p>115 steps/min</p>
                        <p><strong>Step Length Asymmetry:</strong></p><p>4% (R > L)</p>
                        <p><strong>Stance Phase Asymmetry:</strong></p><p>2% (R > L)</p>
                    </div>
                `;
            }
            setResult(analysisResult);
            setIsLoading(false);
        }, delay);
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Gait & Motion Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div
                        className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500 transition-colors h-48 flex flex-col justify-center"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleVideoSelect}
                            accept="video/*"
                            className="hidden"
                        />
                        <ImageIcon className="h-12 w-12 mx-auto text-slate-400" />
                        <p className="mt-2 text-slate-300">
                            {video ? 'Click to change video' : 'Click to upload a video'}
                        </p>
                    </div>

                    {video && (
                        <div className="mt-4">
                            <div className="relative">
                                <video src={video.previewUrl} controls className="w-full rounded-lg"></video>
                                <button
                                    onClick={() => setVideo(null)}
                                    className="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full p-0.5 hover:bg-slate-500"
                                    aria-label="Remove video"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="mt-4 space-y-3">
                                <button onClick={() => handleAnalyze('mediapipe')} disabled={isLoading} className="w-full text-left p-4 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors">
                                    <p className="font-bold text-cyan-400">Start with MediaPipe</p>
                                    <p className="text-sm text-slate-300">Easiest integration for real-time tracking and quick visual feedback.</p>
                                </button>
                                <button onClick={() => handleAnalyze('opencap')} disabled={isLoading} className="w-full text-left p-4 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors">
                                    <p className="font-bold text-cyan-400">Use OpenCap API</p>
                                    <p className="text-sm text-slate-300">For advanced, markerless 3D gait metrics and detailed analysis.</p>
                                </button>
                                <button onClick={() => handleAnalyze('pro')} disabled={isLoading} className="w-full text-left p-4 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors">
                                    <p className="font-bold text-cyan-400 flex items-center gap-2"><SparklesIcon className="h-5 w-5" />Pro Workflow</p>
                                    <p className="text-sm text-slate-300">Combine both for real-time tracking + detailed analysis report.</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-lg">Analysis Report</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg min-h-[400px] border border-slate-700">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <LoadingSpinner />
                                <p className="mt-4 text-slate-300">Analyzing movement...</p>
                                {analysisType === 'opencap' && <p className="text-sm text-slate-400">(This may take a moment)</p>}
                            </div>
                        ) : result ? (
                            <div className="prose prose-slate prose-invert" dangerouslySetInnerHTML={{ __html: result }} />
                        ) : (
                            <p className="text-slate-400 text-center pt-16">Upload a video and choose an analysis method to see the report here.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GaitAnalysis;

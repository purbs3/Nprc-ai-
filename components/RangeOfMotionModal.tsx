import React, { useState, useRef, useEffect } from 'react';
import { getChatStream } from '../services/geminiService';
import type { ChatMessage } from '../types';
import type { Part } from '@google/genai';
import { XIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

interface RangeOfMotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (messages: ChatMessage[]) => void;
}

type Step = 'select' | 'capture_start' | 'review_start' | 'capture_end' | 'review_end' | 'final_review' | 'analyzing' | 'result';

const joints = ['Shoulder', 'Knee', 'Elbow', 'Wrist', 'Ankle', 'Neck', 'Hip'];

const RangeOfMotionModal: React.FC<RangeOfMotionModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState<Step>('select');
    const [selectedJoint, setSelectedJoint] = useState<string>(joints[0]);
    const [startImage, setStartImage] = useState<string | null>(null);
    const [endImage, setEndImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please check permissions and try again.");
                setStep('select');
            }
        };

        const stopCamera = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        if (isOpen && (step === 'capture_start' || step === 'capture_end')) {
            startCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, step]);


    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');

            if (step === 'capture_start') {
                setStartImage(dataUrl);
                setStep('review_start');
            } else if (step === 'capture_end') {
                setEndImage(dataUrl);
                setStep('review_end');
            }
        }
    };

    const handleAnalyze = async () => {
        if (!startImage || !endImage) return;

        setStep('analyzing');
        setError(null);

        try {
            const startImagePart: Part = {
                inlineData: { mimeType: 'image/jpeg', data: startImage.split(',')[1] }
            };
            const endImagePart: Part = {
                inlineData: { mimeType: 'image/jpeg', data: endImage.split(',')[1] }
            };
            const textPart: Part = {
                text: `Please analyze the range of motion for the ${selectedJoint} based on these two images. The first is the starting position, and the second is the final position. Provide an estimated range in degrees, comment on the mobility, and suggest one or two simple exercises. Format the response in markdown.`
            };

            const history = [{ role: 'user', parts: [startImagePart, endImagePart, textPart] }];
            const resultStream = await getChatStream({ history, type: 'rom_analysis' });

            let fullResponse = '';
            for await (const chunk of resultStream) {
                fullResponse += chunk.text;
                setAnalysisResult(fullResponse);
            }
            setStep('result');
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setError("Sorry, the analysis could not be completed. The AI service may be unavailable.");
            setStep('final_review');
        }
    };

    const handleAddToChat = () => {
        const userMessage: ChatMessage = {
            id: `rom-user-${Date.now()}`,
            role: 'user',
            content: `I performed a range of motion check for my ${selectedJoint}.`,
            imageUrls: [startImage!, endImage!],
            images: [
                { mimeType: 'image/jpeg', data: startImage!.split(',')[1] },
                { mimeType: 'image/jpeg', data: endImage!.split(',')[1] }
            ]
        };
        const modelMessage: ChatMessage = {
            id: `rom-model-${Date.now()}`,
            role: 'model',
            content: analysisResult,
        };
        onComplete([userMessage, modelMessage]);
        handleClose();
    };

    const handleClose = () => {
        setStep('select');
        setStartImage(null);
        setEndImage(null);
        setAnalysisResult('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const renderContent = () => {
        if (error && step !== 'final_review') { // Keep error visible on final_review screen
            return (
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => { setError(null); setStep('select'); }} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">Try Again</button>
                </div>
            );
        }

        switch (step) {
            case 'select':
                return (
                    <>
                        <h2 className="text-xl font-bold mb-4">Range of Motion Check</h2>
                        <p className="text-slate-400 mb-6">Select the joint you want to check. You will be guided to take two pictures using your camera.</p>
                        <label htmlFor="joint-select" className="block text-slate-300 mb-2">Select Joint</label>
                        <select
                            id="joint-select"
                            value={selectedJoint}
                            onChange={(e) => setSelectedJoint(e.target.value)}
                            className="w-full bg-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {joints.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                        <button onClick={() => setStep('capture_start')} className="w-full mt-6 bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400">
                            Start
                        </button>
                    </>
                );

            case 'capture_start':
            case 'capture_end':
                return (
                    <>
                        <h2 className="text-lg font-bold mb-2">
                            {step === 'capture_start' ? 'Step 1: Capture Start Position' : 'Step 2: Capture End Position'}
                        </h2>
                        <p className="text-slate-400 mb-4 text-sm">
                            {step === 'capture_start'
                                ? `Position your ${selectedJoint} in a neutral, resting position.`
                                : `Now, move your ${selectedJoint} through its full range of motion.`}
                        </p>
                        <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4 border border-slate-600">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        </div>
                        <button onClick={handleCapture} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400">
                            Capture
                        </button>
                    </>
                );

            case 'review_start':
                return (
                    <>
                        <h2 className="text-lg font-bold mb-2">Review Start Position</h2>
                        <p className="text-slate-400 mb-4 text-sm">Are you happy with this image? This should be your joint in a neutral, resting position.</p>
                        <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4 border border-slate-600">
                            <img src={startImage!} alt="Start position" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-4 mt-2">
                            <button onClick={() => { setStartImage(null); setStep('capture_start'); }} className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-500">
                                Retry
                            </button>
                            <button onClick={() => setStep('capture_end')} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400">
                                Continue
                            </button>
                        </div>
                    </>
                );

            case 'review_end':
                return (
                    <>
                        <h2 className="text-lg font-bold mb-2">Review End Position</h2>
                        <p className="text-slate-400 mb-4 text-sm">Are you happy with this image? This should be your joint at its full range of motion.</p>
                        <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4 border border-slate-600">
                            <img src={endImage!} alt="End position" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-4 mt-2">
                            <button onClick={() => { setEndImage(null); setStep('capture_end'); }} className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-500">
                                Retry
                            </button>
                            <button onClick={() => setStep('final_review')} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400">
                                Continue
                            </button>
                        </div>
                    </>
                );

            case 'final_review':
                return (
                    <>
                        <h2 className="text-lg font-bold mb-2">Review Both Positions</h2>
                        <p className="text-slate-400 mb-4 text-sm">Confirm your start and end positions before analysis.</p>
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm font-semibold text-center mb-1 text-slate-300">Start</p>
                                <img src={startImage!} alt="Start position" className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-center mb-1 text-slate-300">End</p>
                                <img src={endImage!} alt="End position" className="w-full h-full object-cover rounded-lg" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button onClick={handleAnalyze} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400">
                                Analyze
                            </button>
                            <button onClick={() => { setEndImage(null); setStep('capture_end'); }} className="w-full bg-slate-600 text-white py-2 rounded-lg font-semibold hover:bg-slate-500">
                                Retry End Position
                            </button>
                            <button onClick={() => { setStartImage(null); setEndImage(null); setStep('capture_start'); }} className="w-full text-slate-400 text-sm py-1 hover:text-white transition-colors">
                                Start Over
                            </button>
                        </div>
                    </>
                );

            case 'analyzing':
                return (
                    <div className="text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-300">Analyzing your movement... Please wait.</p>
                    </div>
                );

            case 'result':
                return (
                    <>
                        <h2 className="text-xl font-bold mb-4">Analysis Result</h2>
                        <div className="max-h-64 overflow-y-auto bg-slate-900 p-4 rounded-lg prose prose-invert prose-sm prose-p:my-1">
                            <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} />
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={handleClose} className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-500">
                                Discard
                            </button>
                            <button onClick={handleAddToChat} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-400">
                                Add to Chat
                            </button>
                        </div>
                    </>
                );

        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg m-4 relative p-8">
                <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close modal">
                    <XIcon className="h-6 w-6" />
                </button>
                {renderContent()}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </div>
    );
};

export default RangeOfMotionModal;
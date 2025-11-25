import React, { useState, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { HealthIcon, VolumeUpIcon, CheckIcon, CheckDoubleIcon } from './IconComponents';
import { audioPlayerService } from '../services/audioPlayerService';

const parseSimpleMarkdown = (text: string): string => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
};

const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
    const { id, role, content, imageUrls, timestamp, status } = message;
    const isModel = role === 'model';

    const [playerState, setPlayerState] = useState<{
        status: 'idle' | 'loading' | 'playing' | 'error';
        messageId: string | null;
        error?: string;
    }>({ status: 'idle', messageId: null });

    useEffect(() => {
        const unsubscribe = audioPlayerService.subscribe(setPlayerState);
        return () => unsubscribe();
    }, []);

    const isThisMessagePlaying = playerState.messageId === id && playerState.status === 'playing';
    const isThisMessageLoading = playerState.messageId === id && playerState.status === 'loading';

    const handleToggleAudio = () => {
        if (content) {
            audioPlayerService.play(id, content);
        }
    };

    const createMarkup = () => {
        return { __html: parseSimpleMarkdown(content) };
    };

    const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isModel && content === '') {
        return (
            <div className="flex items-start gap-4 animate-fadeIn">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <HealthIcon className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex items-center justify-center bg-slate-800 text-slate-300 px-4 py-3 rounded-lg rounded-tl-none max-w-2xl">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-start gap-4 ${!isModel ? 'justify-end' : ''} animate-fadeIn`}>
            {isModel && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <HealthIcon className="h-5 w-5 text-cyan-400" />
                </div>
            )}
            <div
                className={`text-slate-300 px-4 py-3 rounded-lg max-w-2xl prose prose-invert prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-1 relative group flex flex-col ${isModel
                        ? 'bg-slate-800 rounded-tl-none'
                        : 'bg-cyan-600/50 text-white rounded-br-none'
                    }`}
            >
                {imageUrls && imageUrls.length > 0 && (
                    <div className={`grid gap-2 mb-2 ${imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {imageUrls.map((url, index) => (
                            <img key={index} src={url} alt={`User upload ${index + 1}`} className="w-full h-auto rounded-lg" />
                        ))}
                    </div>
                )}
                <div className="flex-grow" dangerouslySetInnerHTML={createMarkup()} />
                <div className="flex justify-end items-center gap-2 mt-2 text-xs text-slate-400 self-end">
                    <span>{formattedTime}</span>
                    {!isModel && status && (
                        status === 'sent' ? <CheckIcon className="h-4 w-4" /> : <CheckDoubleIcon className="h-4 w-4 text-cyan-400" />
                    )}
                </div>
                {isModel && content && (
                    <button
                        onClick={handleToggleAudio}
                        className={`absolute -bottom-4 -right-4 h-8 w-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 ${isThisMessagePlaying ? 'bg-red-500 text-white' : 'bg-slate-700 text-cyan-400 hover:bg-slate-600'
                            }`}
                        aria-label={isThisMessagePlaying ? "Stop audio" : "Play audio"}
                        disabled={isThisMessageLoading}
                    >
                        {isThisMessageLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <VolumeUpIcon className="h-5 w-5" />}
                    </button>
                )}
                {playerState.messageId === id && playerState.status === 'error' && <p className="text-red-400 text-xs mt-1">{playerState.error}</p>}
            </div>
        </div>
    );
};

export default ChatMessage;
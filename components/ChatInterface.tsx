import React, { useState, useRef, useEffect, FormEvent } from 'react';
import type { Content } from '@google/genai';
import { getChatStream } from '../services/geminiService';
import type { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon, MicrophoneIcon, LightbulbIcon, ClipboardIcon } from './IconComponents';

// FIX: Add type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}


const CHAT_HISTORY_KEY_USER = 'nprc-chat-history-user';
const CHAT_HISTORY_KEY_CLINICIAN = 'nprc-chat-history-clinician';
const CONTEXT_WINDOW_SIZE = 15;

interface ChatInterfaceProps {
    userType: 'user' | 'clinician';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userType }) => {
    const historyKey = userType === 'user' ? CHAT_HISTORY_KEY_USER : CHAT_HISTORY_KEY_CLINICIAN;

    const getInitialMessages = (): ChatMessageType[] => {
        let messages: ChatMessageType[] = [];
        try {
            const savedMessages = localStorage.getItem(historyKey);
            if (savedMessages) {
                messages = JSON.parse(savedMessages);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }

        if (messages.length === 0) {
            const initialContent = userType === 'user'
                ? 'Hello! I am your AI assistant from NPRC Physiotherapy. How can I help you with your muscle or joint concerns today? You can start a guided check-up using the button below.'
                : 'Hello! I am your AI clinical assistant. You can ask me about differential diagnoses, treatment protocols, or recent research. How can I assist you?';
            return [{
                id: `initial-${Date.now()}`,
                role: 'model',
                content: initialContent,
                timestamp: new Date().toISOString(),
                status: 'read'
            }];
        }
        return messages;
    };

    const [messages, setMessages] = useState<ChatMessageType[]>(getInitialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [isThinkingMode, setThinkingMode] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const preRecordingInputRef = useRef<string>('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionImpl) {
            setSpeechError("Speech recognition is not supported in this browser.");
            return;
        }
        const recognition: SpeechRecognition = new SpeechRecognitionImpl();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setSpeechError(`An error occurred: ${event.error}. Please check permissions.`);
            setIsRecording(false);
        };
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
            setInput(preRecordingInputRef.current + transcript);
        };
        recognitionRef.current = recognition;
        return () => recognitionRef.current?.stop();
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => { localStorage.setItem(historyKey, JSON.stringify(messages)); }, [messages, historyKey]);
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleApiError = () => {
        const errorMessage = 'Sorry, the AI service is not available. Please try again later.';
        setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'model' && newMessages[newMessages.length - 1].content === '') {
                newMessages[newMessages.length - 1].content = errorMessage;
            } else {
                newMessages.push({ id: `model-error-${Date.now()}`, role: 'model', content: errorMessage, timestamp: new Date().toISOString(), status: 'read' });
            }
            return newMessages;
        });
    };

    const streamResponse = async (history: Content[]) => {
        const modelMessagePlaceholder: ChatMessageType = {
            id: `model-${Date.now()}`,
            role: 'model',
            content: '',
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        setMessages(prev => [...prev, modelMessagePlaceholder]);
        setInput('');

        try {
            const stream = await getChatStream({ history, isThinkingMode, type: userType === 'user' ? 'user' : 'clinician_chat' });
            let fullResponse = '';
            let isFirstChunk = true;

            for await (const chunk of stream) {
                if (isFirstChunk) {
                    // Mark the user's message as 'read' as soon as we get the first chunk
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const userMessageIndex = newMessages.length - 2; // The message before the placeholder
                        if (userMessageIndex >= 0 && newMessages[userMessageIndex].role === 'user') {
                            newMessages[userMessageIndex] = { ...newMessages[userMessageIndex], status: 'read' };
                        }
                        return newMessages;
                    });
                    isFirstChunk = false;
                }
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponse += chunkText;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = fullResponse;
                        return newMessages;
                    });
                }
            }
        } catch (error: any) {
            console.error("AI chat stream error:", error);
            handleApiError();
        } finally {
            setIsLoading(false);
            // Mark the final model message as 'read'
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessageIndex = newMessages.length - 1;
                if (lastMessageIndex >= 0) {
                    newMessages[lastMessageIndex] = { ...newMessages[lastMessageIndex], status: 'read' };
                }
                return newMessages;
            });
        }
    };

    const sendMessage = async (messageContent: string) => {
        const trimmedInput = messageContent.trim();
        if (!trimmedInput || isLoading) return;
        if (isRecording) recognitionRef.current?.stop();

        setIsLoading(true);
        const recentMessages = messages.slice(-CONTEXT_WINDOW_SIZE).filter(msg => msg && msg.content);
        const history: Content[] = recentMessages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));

        const userMessageForUi: ChatMessageType = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmedInput,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        setMessages(prev => [...prev, userMessageForUi]);

        history.push({ role: 'user', parts: [{ text: trimmedInput }] });

        await streamResponse(history);
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleToggleRecording = () => {
        if (!recognitionRef.current) return;
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            preRecordingInputRef.current = input.trim() ? input.trim() + ' ' : '';
            recognitionRef.current.start();
        }
    };

    const placeholderText = userType === 'user' ? "Describe your symptoms..." : "Ask a clinical question...";

    return (
        <>
            <section className="bg-slate-900 flex flex-col h-full">
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-xl">
                    <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
                        {userType === 'user' && (
                            <button
                                type="button"
                                onClick={() => sendMessage("I'd like to start a guided symptom check.")}
                                className="p-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 transition-colors disabled:opacity-50 h-full flex flex-col justify-center items-center text-center"
                                disabled={isLoading}
                                aria-label="Start guided symptom check"
                                title="Start Guided Symptom Check"
                            >
                                <ClipboardIcon className="h-5 w-5" />
                                <span className="text-xs mt-1">Check</span>
                            </button>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                            rows={1}
                            placeholder={placeholderText}
                            className="flex-1 bg-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors resize-none overflow-hidden self-stretch"
                            disabled={isLoading}
                        />
                        <div className="flex flex-col gap-1 self-stretch">
                            <button
                                type="button"
                                onClick={() => setThinkingMode(prev => !prev)}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 flex-1 ${isThinkingMode ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-slate-200 hover:bg-slate-500'}`}
                                disabled={isLoading}
                                title={isThinkingMode ? 'Thinking Mode is ON' : 'Enable Thinking Mode'}
                            >
                                <LightbulbIcon className="h-5 w-5" />
                            </button>
                            {recognitionRef.current && (
                                <button
                                    type="button"
                                    onClick={handleToggleRecording}
                                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 flex-1 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-600 text-slate-200 hover:bg-slate-500'}`}
                                    disabled={isLoading}
                                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                                >
                                    <MicrophoneIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-cyan-500 text-white p-3 rounded-lg hover:bg-cyan-400 transition-colors disabled:bg-slate-600 self-stretch flex items-center w-14 justify-center"
                            disabled={isLoading || !input.trim()}
                            aria-label="Send message"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <SendIcon className="h-6 w-6" />}
                        </button>
                    </form>
                    {speechError && <p className="text-red-400 text-xs text-center mt-2">{speechError}</p>}
                </div>
            </section>
        </>
    );
};

export default ChatInterface;

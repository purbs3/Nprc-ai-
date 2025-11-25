import { generateSpeech } from './geminiService';
import { decode, decodeAudioData } from '../utils/audio';

// FIX: Add type declaration for webkitAudioContext to support Safari and older browsers.
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

type AudioState = 'idle' | 'loading' | 'playing' | 'error';
type Listener = (state: { status: AudioState; messageId: string | null; error?: string }) => void;

class AudioPlayerService {
    private audioContext: AudioContext | null = null;
    private source: AudioBufferSourceNode | null = null;
    private listeners: Set<Listener> = new Set();
    private currentMessageId: string | null = null;
    private status: AudioState = 'idle';
    private error?: string;

    private initializeAudioContext() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.", e);
                this.status = 'error';
                this.error = 'Audio playback is not supported on this device.';
                this.notifyListeners();
            }
        }
        // Ensure context is running (required after user interaction)
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener({ status: this.status, messageId: this.currentMessageId, error: this.error }));
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        // Immediately notify new subscriber of the current state
        listener({ status: this.status, messageId: this.currentMessageId, error: this.error });
        return () => this.unsubscribe(listener);
    }

    unsubscribe(listener: Listener) {
        this.listeners.delete(listener);
    }

    async play(messageId: string, text: string) {
        if (this.status === 'playing' && this.currentMessageId === messageId) {
            this.stop();
            return;
        }

        this.stop(); // Stop any currently playing audio
        this.initializeAudioContext();
        if (!this.audioContext) return;

        this.currentMessageId = messageId;
        this.status = 'loading';
        this.error = undefined;
        this.notifyListeners();

        try {
            const base64Audio = await generateSpeech(text);
            const audioData = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioData, this.audioContext, 24000, 1);

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            source.onended = () => {
                if (this.currentMessageId === messageId) { // Only update state if it hasn't been interrupted
                    this.status = 'idle';
                    this.currentMessageId = null;
                    this.notifyListeners();
                }
            };

            this.source = source;
            this.source.start();
            this.status = 'playing';
            this.notifyListeners();

        } catch (err: any) {
            console.error("Audio generation failed:", err);
            this.status = 'error';
            this.error = 'Could not play audio.';
            this.notifyListeners();
        }
    }

    stop() {
        if (this.source) {
            this.source.onended = null; // Prevent onended from firing on manual stop
            this.source.stop();
            this.source = null;
        }
        this.status = 'idle';
        this.currentMessageId = null;
        this.notifyListeners();
    }
}

export const audioPlayerService = new AudioPlayerService();

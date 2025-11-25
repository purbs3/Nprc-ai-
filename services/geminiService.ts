import { GoogleGenAI, Content, GenerateContentResponse, Modality, Type } from "@google/genai";
import { stripHtml } from '../utils/html';

// Centralized function to get the AI client, ensuring API key is present.
function getAiClient(): GoogleGenAI {
    // FIX: Use process.env.API_KEY as per guidelines.
    if (!process.env.API_KEY) {
        throw new Error('Google AI API key must be set in the process.env.API_KEY environment variable.');
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}


const USER_SYSTEM_INSTRUCTION = 'You are an AI assistant for NPRC Physiotherapy. Your goal is to provide helpful, safe, and informative advice related to physiotherapy, rehabilitation, and muscle/joint health. When a user sends the message "I\'d like to start a guided symptom check.", you must initiate a step-by-step diagnostic conversation. Ask one question at a time to gather information. Start by asking something like, "Of course. To start, where are you feeling the discomfort?". Based on their answer, ask relevant follow-up questions about pain intensity (e.g., on a scale of 1-10), type (e.g., sharp, dull, aching), duration, and what activities make it better or worse. Once you have sufficient information, provide a preliminary assessment and suggest next steps. Your responses should be formatted in markdown. CRITICAL: Always include a disclaimer in your responses that you are an AI assistant and your advice should not be considered a substitute for a professional medical diagnosis. Advise users to consult a qualified physiotherapist or doctor for any persistent or severe issues.';

const CLINICIAN_CHAT_SYSTEM_INSTRUCTION = 'You are an expert AI clinical assistant for physiotherapists and medical professionals. Your tone should be professional, technical, and collaborative. Provide concise, evidence-based information. You can assist with differential diagnoses, suggest relevant orthopedic tests, summarize recent research on a specific condition, or help brainstorm treatment plans. When asked for information, provide it directly and assume the user has a high level of medical knowledge. Format responses in clear markdown. Do not include disclaimers about not being a medical professional, as you are acting as a tool for one.';

const CLINICIAN_POSTURE_SYSTEM_INSTRUCTION = 'You are an expert AI physiotherapy assistant for clinicians. Analyze the provided image for postural assessment. Identify key postural deviations such as forward head posture, rounded shoulders, pelvic tilt (anterior/posterior), and kyphosis/lordosis. Provide a technical breakdown of your findings, mentioning specific anatomical landmarks and potential muscle imbalances (e.g., "tight pectorals and weak rhomboids"). Conclude with potential areas of focus for a treatment plan. Your response should be professional, technical, and formatted in markdown. Start your response with "## Posture Analysis Report".';

const CLINICIAN_ROM_SYSTEM_INSTRUCTION = 'You are an expert AI physiotherapy assistant. Analyze the two provided images for range of motion (ROM) assessment of the specified joint. The first image is the starting position, and the second is the final position. Provide an estimated ROM in degrees, comment on the mobility (e.g., normal, limited, excessive), and suggest one or two simple exercises to improve or maintain this range. Your response must be professional, technical, and formatted in markdown. Start your response with "## Range of Motion Analysis Report".';


interface GetChatStreamOptions {
    history: Content[];
    isThinkingMode?: boolean;
    type?: 'user' | 'rom_analysis' | 'clinician_chat';
}

export async function getChatStream({ history, isThinkingMode = false, type = 'user' }: GetChatStreamOptions): Promise<AsyncGenerator<GenerateContentResponse>> {
    const ai = getAiClient();
    const model = (isThinkingMode || type === 'rom_analysis' || type === 'clinician_chat') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    let systemInstruction = USER_SYSTEM_INSTRUCTION;
    if (type === 'rom_analysis') {
        systemInstruction = CLINICIAN_ROM_SYSTEM_INSTRUCTION;
    } else if (type === 'clinician_chat') {
        systemInstruction = CLINICIAN_CHAT_SYSTEM_INSTRUCTION;
    }

    const config: {
        systemInstruction: string;
        thinkingConfig?: { thinkingBudget: number };
    } = {
        systemInstruction,
    };

    if (isThinkingMode) {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    return ai.models.generateContentStream({
        model,
        contents: history,
        config,
    });
}


export async function analyzePostureForClinician(base64Image: string, imageMimeType: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    const ai = getAiClient();
    const imagePart = {
        inlineData: {
            mimeType: imageMimeType,
            data: base64Image,
        },
    };
    const textPart = {
        text: 'Analyze the posture in this image.',
    };

    return ai.models.generateContentStream({
        model: 'gemini-2.5-pro', // Use pro model for better analysis
        contents: [{ role: 'user', parts: [imagePart, textPart] }],
        config: {
            systemInstruction: CLINICIAN_POSTURE_SYSTEM_INSTRUCTION,
        },
    });
}


export async function generateSpeech(text: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    return base64Audio;
}

export async function generateMetaDescription(content: string): Promise<{ description: string; keywords: string; }> {
    const ai = getAiClient();
    const plainTextContent = stripHtml(content).replace(/\s+/g, ' ').substring(0, 4000);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following blog post content, generate an SEO-optimized meta description and meta keywords.
        
        Content: "${plainTextContent}"
        
        The meta description should be a concise summary, under 160 characters.
        The meta keywords should be a comma-separated list of 5-7 relevant keywords.
        Return the response as a JSON object with keys "description" and "keywords".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: {
                        type: Type.STRING,
                        description: "A concise, SEO-optimized summary of the blog post, under 160 characters."
                    },
                    keywords: {
                        type: Type.STRING,
                        description: "A comma-separated list of 5 to 7 relevant SEO keywords for the blog post."
                    }
                }
            }
        }
    });

    const jsonString = response.text.trim();
    try {
        const parsed = JSON.parse(jsonString);
        return {
            description: parsed.description || '',
            keywords: parsed.keywords || ''
        };
    } catch (e) {
        console.error("Failed to parse JSON response for meta description:", e);
        return { description: 'Could not generate description.', keywords: '' };
    }
}

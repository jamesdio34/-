
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Question, BossData, SubjectType } from "../types";
import { FALLBACK_QUESTIONS, FALLBACK_BOSSES } from "../constants";

// Helper to decode base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert raw PCM data (Int16) to an AudioBuffer
// Gemini TTS returns raw PCM at 24kHz usually.
async function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  // The data is 16-bit integer PCM.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playAudioFromBase64 = async (base64Audio: string): Promise<void> => {
  try {
    // Gemini TTS output is typically 24kHz mono PCM
    const sampleRate = 24000;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
    
    const pcmBytes = decode(base64Audio);
    const audioBuffer = await pcmToAudioBuffer(pcmBytes, audioContext, sampleRate, 1);
    
    return new Promise((resolve) => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => resolve();
        source.start(0);
    });
  } catch (e) {
    console.warn("Audio playback failed or not supported:", e);
    return Promise.resolve();
  }
};

const getAIClient = () => {
    if (!process.env.API_KEY) {
        console.warn("API Key is missing! Using offline mode.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

// Helper to get fallback questions
const getFallbackQuestions = (subject: SubjectType): Question[] => {
    let pool: Question[] = [];
    if (subject === SubjectType.MIXED) {
        pool = [
            ...(FALLBACK_QUESTIONS[SubjectType.CHINESE] || []),
            ...(FALLBACK_QUESTIONS[SubjectType.MATH] || []),
            ...(FALLBACK_QUESTIONS[SubjectType.LIFE] || [])
        ];
    } else {
        pool = FALLBACK_QUESTIONS[subject] || [];
    }
    // Shuffle array and pick 3
    return pool.sort(() => 0.5 - Math.random()).slice(0, 3);
};

export const generateQuestions = async (subject: SubjectType, level: number, seenHistory: string[] = []): Promise<Question[]> => {
    const ai = getAIClient();
    if (!ai) return getFallbackQuestions(subject);

    let subjectPromptContext = "";
    if (subject === SubjectType.MIXED) {
        subjectPromptContext = "綜合測驗 (混合國語、數學、生活)。請隨機分配這三個科目的題目。";
    } else {
        subjectPromptContext = `科目：${subject}。`;
    }

    // Pass recent history to avoid repeats (limit to last 20 to save context)
    const recentHistory = seenHistory.slice(-20).join("; ");
    
    const prompt = `
      為台灣國小一年級學生設計 3 到 5 題單選題。
      ${subjectPromptContext}
      難度：Level ${level} (1 is easiest, higher is harder).
      確保題目簡單易懂，適合 6-7 歲兒童。
      
      Also, assign a difficulty level (1, 2, or 3) to each question based on its complexity:
      1: Easy (Simple recall or basic fact)
      2: Medium (Requires some thought or calculation)
      3: Hard (Slightly challenging for a 1st grader)

      國語包含注音符號或簡單國字。
      數學包含20以內加減法、比較大小、圖形、時鐘。
      生活包含日常常識。
      
      IMPORTANT: Avoid generating questions that are similar to these previously asked questions:
      [${recentHistory}]
      
      Make sure the new questions are unique and fresh.
      Return ONLY valid JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING, description: "The question text" },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
                            correctIndex: { type: Type.INTEGER, description: "0-3 index" },
                            explanation: { type: Type.STRING, description: "Simple explanation for the kid" },
                            difficulty: { type: Type.INTEGER, description: "Difficulty level 1-3" }
                        }
                    }
                }
            }
        });
        
        if (response.text) {
            return JSON.parse(response.text) as Question[];
        }
        return getFallbackQuestions(subject);
    } catch (e: any) {
        // Gracefully handle Quota limits without scaring the user/developer console
        if (e.status === 429 || e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
             console.warn("Gemini API Quota Exceeded. Switching to Offline Mode for Questions.");
        } else {
             console.error("Gemini Question Gen Error, using fallback", e);
        }
        return getFallbackQuestions(subject);
    }
};

export const generateBoss = async (subject: SubjectType, level: number): Promise<BossData | null> => {
    const ai = getAIClient();
    
    // Fallback Boss Logic
    const getFallbackBoss = () => {
        return FALLBACK_BOSSES[Math.floor(Math.random() * FALLBACK_BOSSES.length)];
    };

    if (!ai) return getFallbackBoss();

    try {
        let bossContext = `Subject Zone: ${subject}.`;
        if (subject === SubjectType.MIXED) {
            bossContext = "Zone: The Chaos Tower (Mixture of all subjects).";
        }

        // 1. Generate Boss Concept & Taunt Text
        const conceptPrompt = `
            Design a RPG boss monster for a kids educational game.
            ${bossContext} Level: ${level}.
            
            The boss must be a "Marvel Comic Book Villain" style character, but suitable for kids (e.g. a cartoon supervillain).
            The boss should have a name and a funny, rhyming taunt in Traditional Chinese (Taiwan).
            The taunt should be slightly cocky but kid-friendly (e.g., "你算不出這題的！").
        `;
        
        const textResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: conceptPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        taunt: { type: Type.STRING },
                    }
                }
            }
        });

        const bossData = JSON.parse(textResponse.text || "{}");
        if (!bossData.name) throw new Error("Failed to gen boss text");

        // 2. Generate Boss Image using DiceBear Adventurer API (Vector Art Style)
        // This simulates "grabbing resources" from vector animation sites without using AI image generation quota
        const seed = encodeURIComponent(bossData.name);
        const imageUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;

        // 3. Generate Taunt Audio
        // Using gemini-2.5-flash-preview-tts
        let audioBase64: string | undefined = undefined;
        try {
            const speechResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: bossData.taunt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep voice for boss
                        },
                    },
                },
            });
            audioBase64 = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        } catch (audioError) {
            // Audio is optional, don't fail the whole boss gen
            console.warn("Audio gen skipped (quota or error)");
        }

        return {
            name: bossData.name,
            tauntText: bossData.taunt,
            imageUrl: imageUrl,
            tauntAudioBase64: audioBase64
        };

    } catch (e: any) {
        // Gracefully handle Quota limits
        if (e.status === 429 || e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
             console.warn("Gemini API Quota Exceeded. Switching to Offline Mode for Boss.");
        } else {
             console.error("Boss Gen Error, using fallback", e);
        }
        return getFallbackBoss();
    }
};

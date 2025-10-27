
import { GoogleGenAI, Type } from '@google/genai';
import { Song, Setlist, SongSection } from '../types';

const stemsBaseUrl = 'https://t-mullen.github.io/g-player/music/get_lucky/';

export const mockSongs: Song[] = [];

// FIX: Export mockSetlists to be used in SongContext.
export const mockSetlists: Setlist[] = [];

// FIX: Use process.env.API_KEY to get the API key as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches the song structure from the Gemini API.
 * @param title The title of the song.
 * @param artist The artist of the song.
 * @returns A promise that resolves to an array of song sections or null.
 */
// FIX: Export getSongStructureFromGemini and implement its functionality.
export const getSongStructureFromGemini = async (title: string, artist: string): Promise<SongSection[] | null> => {
    try {
        const prompt = `Analyze the song structure of "${title}" by ${artist}. Provide a list of sections (like Intro, Verse, Chorus, Bridge, Outro) and their approximate length as a decimal fraction of the total song length. The sum of all lengths should be 1.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sections: {
                            type: Type.ARRAY,
                            description: 'An array of song sections.',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: {
                                        type: Type.STRING,
                                        description: 'The name of the section (e.g., Intro, Verse, Chorus).',
                                    },
                                    length: {
                                        type: Type.NUMBER,
                                        description: 'The approximate length of the section as a decimal fraction of the total song length (e.g., 0.25 for 25%).',
                                    },
                                },
                                required: ['label', 'length'],
                            },
                        },
                    },
                    required: ['sections'],
                },
            },
        });

        const jsonStr = response.text.trim();
        if (!jsonStr) {
            console.error('Gemini API returned an empty response for song structure.');
            return null;
        }

        const result = JSON.parse(jsonStr);
        if (result && Array.isArray(result.sections)) {
            // Validate and normalize lengths to sum to 1, as the model might not be perfect.
            let totalLength = result.sections.reduce((sum: number, section: SongSection) => sum + (section.length || 0), 0);
            if (totalLength > 0) {
                return result.sections.map((section: SongSection) => ({
                    label: section.label,
                    length: (section.length || 0) / totalLength,
                }));
            }
            return result.sections;
        }
        return null;
    } catch (error) {
        console.error("Error fetching song structure from Gemini:", error);
        return null;
    }
};

/**
 * Creates a setlist using the Gemini API based on a user prompt and available songs.
 * @param prompt The user's prompt for creating the setlist.
 * @param songs The list of available songs.
 * @returns A promise that resolves to an object with the setlist name and song titles, or null.
 */
// FIX: Export createSetlistFromGemini and implement its functionality.
export const createSetlistFromGemini = async (prompt: string, songs: Song[]): Promise<{ name: string; songTitles: string[] } | null> => {
    try {
        const availableSongs = songs.map(s => `- "${s.title}" (Key: ${s.key}, BPM: ${s.bpm})`).join('\n');
        const fullPrompt = `
            Based on the user's request, create a setlist from the available songs.
            User Request: "${prompt}"
            
            Available Songs:
            ${availableSongs}

            Provide a suitable name for the setlist and an array of song titles in the correct order.
            Only use songs from the provided list.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: {
                            type: Type.STRING,
                            description: 'A creative name for the setlist.',
                        },
                        songTitles: {
                            type: Type.ARRAY,
                            description: 'An array of song titles from the available list, in the recommended order.',
                            items: {
                                type: Type.STRING,
                            },
                        },
                    },
                    required: ['name', 'songTitles'],
                },
            },
        });

        const jsonStr = response.text.trim();
        if (!jsonStr) {
            console.error('Gemini API returned an empty response for setlist creation.');
            return null;
        }

        const result = JSON.parse(jsonStr);
        if (result && result.name && Array.isArray(result.songTitles)) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error creating setlist from Gemini:", error);
        return null;
    }
};
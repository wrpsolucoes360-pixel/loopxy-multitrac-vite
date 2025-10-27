import React, { useState } from 'react';
import { Song } from '../types';
import { Icons } from './Icons';
import { createSetlistFromGemini } from '../services/geminiService';

interface AiSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, songIds: number[]) => void;
  songs: Song[];
}

export const AiSetlistModal: React.FC<AiSetlistModalProps> = ({ isOpen, onClose, onSave, songs }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedSetlist, setGeneratedSetlist] = useState<{ name: string; songTitles: string[] } | null>(null);
    const [setlistName, setSetlistName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for the AI.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedSetlist(null);
        try {
            const result = await createSetlistFromGemini(prompt, songs);
            if (result) {
                setGeneratedSetlist(result);
                setSetlistName(result.name);
            } else {
                setError('The AI could not generate a setlist. Please try a different prompt.');
            }
        } catch (e) {
            setError('An error occurred while communicating with the AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (!generatedSetlist || !setlistName.trim()) return;

        const songMap = new Map(songs.map(s => [s.title.toLowerCase(), s.id]));
        const songIds = generatedSetlist.songTitles
            .map(title => songMap.get(title.toLowerCase()))
            .filter((id): id is number => id !== undefined);
        
        if (songIds.length !== generatedSetlist.songTitles.length) {
            setError("Some song titles returned by the AI could not be matched to your library. Please try generating again.");
            return;
        }

        onSave(setlistName, songIds);
        resetState();
    };

    const resetState = () => {
        setPrompt('');
        setIsLoading(false);
        setGeneratedSetlist(null);
        setSetlistName('');
        setError(null);
        onClose();
    }

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-audio-dark/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-audio-mid rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-audio-border flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><Icons.Sparkles /> Create Setlist with AI</h2>
          <button onClick={resetState} className="p-2 hover:bg-audio-light rounded-md" aria-label="Close dialog"><Icons.Close /></button>
        </header>

        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
            {/* Left Panel: Prompt & Library */}
            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-audio-text-dark mb-1">Your Prompt</label>
                    <textarea 
                        id="ai-prompt"
                        rows={6}
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g., A 25-minute setlist starting upbeat in G and ending slow in D."
                        className="w-full bg-audio-light border border-audio-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-audio-accent"
                    />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-audio-text-dark mb-2">Available Songs in Library</h3>
                    <div className="bg-audio-light/50 border border-audio-border rounded-md max-h-48 overflow-y-auto p-2 text-xs space-y-1">
                        {songs.map(song => (
                            <p key={song.id} className="text-audio-text-disabled">
                                <span className="font-semibold text-audio-text-dark">{song.title}</span> ({song.key} / {song.bpm} BPM)
                            </p>
                        ))}
                    </div>
                </div>
                 <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-auto bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-500 disabled:bg-indigo-400/50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? <><Icons.Loader /> Generating...</> : 'Generate Setlist'}
                </button>
            </div>
            
            {/* Right Panel: Result */}
            <div className="flex flex-col bg-audio-light p-4 rounded-md">
                <h3 className="font-semibold mb-3 text-audio-text-light">Generated Setlist</h3>
                {isLoading ? (
                    <div className="flex-grow flex items-center justify-center text-center text-audio-text-disabled">
                        <p>AI is thinking...</p>
                    </div>
                ) : error ? (
                    <div className="flex-grow flex items-center justify-center text-center text-red-400 bg-red-900/20 p-4 rounded-md">
                        <p>{error}</p>
                    </div>
                ) : generatedSetlist ? (
                    <div className="flex-grow flex flex-col">
                        <div className="mb-4">
                            <label htmlFor="setlist-name" className="block text-sm font-medium text-audio-text-dark mb-1">Setlist Name</label>
                            <input
                                type="text"
                                id="setlist-name"
                                value={setlistName}
                                onChange={e => setSetlistName(e.target.value)}
                                className="w-full bg-audio-dark border border-audio-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-audio-accent"
                            />
                        </div>
                        <ol className="list-decimal list-inside space-y-2 text-audio-text-light flex-grow">
                            {generatedSetlist.songTitles.map((title, index) => (
                                <li key={index}>{title}</li>
                            ))}
                        </ol>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-audio-text-disabled">
                        <p>Your generated setlist will appear here.</p>
                    </div>
                )}
            </div>
        </main>
        
        <footer className="p-4 border-t border-audio-border flex justify-end gap-3">
          <button onClick={resetState} className="px-4 py-2 bg-audio-light rounded-md hover:bg-audio-border">Cancel</button>
          <button onClick={handleSave} disabled={!generatedSetlist || isLoading || !setlistName} className="px-4 py-2 bg-audio-accent text-white rounded-md hover:opacity-90 disabled:bg-audio-light/50 disabled:cursor-not-allowed">Save Setlist</button>
        </footer>
      </div>
    </div>
  );
};

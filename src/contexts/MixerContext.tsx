import React, { createContext, useState, useEffect, useContext } from 'react';
import { Track } from '../types';
import { useSongs } from './SongContext';

interface MixerContextType {
  currentTracks: Track[];
  handleTrackUpdate: (trackId: string, updates: Partial<Track>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const MixerContext = createContext<MixerContextType | undefined>(undefined);

export const MixerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeSong } = useSongs();
  
  const [history, setHistory] = useState<Track[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (activeSong) {
        setHistory([activeSong.tracks]);
        setHistoryIndex(0);
    }
  }, [activeSong]);
  
  const currentTracks = history[historyIndex] || [];

  const handleTrackUpdate = (trackId: string, updates: Partial<Track>) => {
    const newTracks = currentTracks.map(t => (t.id === trackId ? { ...t, ...updates } : t));
    const newHistory = [...history.slice(0, historyIndex + 1), newTracks];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => historyIndex > 0 && setHistoryIndex(historyIndex - 1);
  const redo = () => historyIndex < history.length - 1 && setHistoryIndex(historyIndex + 1);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <MixerContext.Provider value={{ currentTracks, handleTrackUpdate, undo, redo, canUndo, canRedo }}>
      {children}
    </MixerContext.Provider>
  );
};

export const useMixer = () => {
  const context = useContext(MixerContext);
  if (context === undefined) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
};

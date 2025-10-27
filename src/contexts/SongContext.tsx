

import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Song, Setlist, Track } from '../types';
import { mockSongs, mockSetlists } from '../services/geminiService';

export type NewSongData = Omit<Song, 'id' | 'tracks' | 'artworkUrl'> & { tracks: Omit<Track, 'id' | 'url'>[] } & { files: File[]; saveToCloud: boolean; };

interface SongContextType {
  songs: Song[];
  setlists: Setlist[];
  activeSongId: number;
  activeSong: Song | undefined;
  activeSetlist: Setlist | undefined;
  setActiveSetlistId: (id: number) => void;
  selectSong: (id: number) => void;
  saveSong: (newSongData: NewSongData) => Song;
  updateSong: (songId: number, updates: Partial<Song>) => void;
  saveSetlist: (name: string, songIds: number[]) => void;
  handleRemoveSongFromSetlist: (songId: number) => void;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

const SIMULATED_CLOUD_URL = 'https://cdn.glitch.global/2d6f2122-cda3-48f8-b119-1221086b53e8/ambient_pad_loop_c.wav?v=1684341981053';

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [setlists, setSetlists] = useState<Setlist[]>(mockSetlists);
  const [activeSongId, setActiveSongId] = useState<number>(0);
  const [activeSetlistId, setActiveSetlistId] = useState<number>(0);

  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem('multiTrackPlayerState');
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.songs && savedState.setlists && savedState.activeSongId !== undefined) {
           setSongs(savedState.songs);
           setSetlists(savedState.setlists);
           setActiveSongId(savedState.activeSongId);
           setActiveSetlistId(savedState.activeSetlistId || savedState.setlists[0]?.id || 0);
        }
      } else {
        // First time load, initialize with mock data if available
         if (mockSetlists.length > 0) {
            setSetlists(mockSetlists);
            setActiveSetlistId(mockSetlists[0].id);
         }
         if (mockSongs.length > 0) {
            setSongs(mockSongs);
         }
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const stateToSave = { 
        songs, 
        setlists, 
        activeSongId,
        activeSetlistId
      };
      localStorage.setItem('multiTrackPlayerState', JSON.stringify(stateToSave));
    } catch (error) {
       console.error('Error saving state to localStorage:', error);
    }
  }, [songs, setlists, activeSongId, activeSetlistId]);

  const selectSong = useCallback((id: number) => {
    setActiveSongId(id);
  }, []);

  const saveSong = (newSongData: NewSongData) => {
    const { files, saveToCloud, ...songDetails } = newSongData;
    const newSongId = Date.now();
    
    // TODO: This is where the actual Google Drive integration would happen.
    // 1. Authenticate user with OAuth 2.0.
    // 2. For each file in `files`, upload it to Google Drive API.
    // 3. Get a permanent, shareable URL for each file from the API response.
    // 4. Use those permanent URLs instead of SIMULATED_CLOUD_URL.

    const newTracks: Track[] = newSongData.tracks.map((trackData, index) => ({
      ...trackData,
      id: `${newSongId}-${index}-${files[index].name.replace(/\s/g, '_')}`,
      url: saveToCloud ? SIMULATED_CLOUD_URL : URL.createObjectURL(files[index]),
    }));

    const newSong: Song = {
      ...songDetails,
      id: newSongId,
      artworkUrl: `https://i.pravatar.cc/40?img=${newSongId % 10}`,
      tracks: newTracks,
    };

    setSongs(prevSongs => [...prevSongs, newSong]);
    
    // Add the new song to the current setlist
    setSetlists(prevSetlists => prevSetlists.map(sl => 
        sl.id === activeSetlistId ? { ...sl, songIds: [...sl.songIds, newSong.id] } : sl
    ));

    // If no song was previously active, or to auto-select the new one
    if (activeSongId === 0) {
      selectSong(newSong.id);
    }
    return newSong;
  };

  const updateSong = useCallback((songId: number, updates: Partial<Song>) => {
    setSongs(currentSongs =>
      currentSongs.map(song =>
        song.id === songId ? { ...song, ...updates } : song
      )
    );
  }, []);
  
  const saveSetlist = (name: string, songIds: number[]) => {
    const newSetlist: Setlist = {
      id: Date.now(),
      name,
      songIds,
    };
    setSetlists(prevSetlists => [...prevSetlists, newSetlist]);
    setActiveSetlistId(newSetlist.id);
    if (songIds.length > 0) {
      selectSong(songIds[0]);
    }
  };
  
  const updateSetlist = useCallback((setlistId: number, updates: Partial<Pick<Setlist, 'name' | 'songIds'>>) => {
      setSetlists(currentSetlists =>
          currentSetlists.map(setlist =>
              setlist.id === setlistId ? { ...setlist, ...updates } : setlist
          )
      );
  }, []);

  const activeSong = useMemo(() => songs.find(s => s.id === activeSongId), [activeSongId, songs]);
  const activeSetlist = useMemo(() => setlists.find(s => s.id === activeSetlistId), [activeSetlistId, setlists]);

  const handleRemoveSongFromSetlist = useCallback((songId: number) => {
    if (!activeSetlist) return;
    const newSongIds = activeSetlist.songIds.filter(id => id !== songId);
    updateSetlist(activeSetlist.id, { songIds: newSongIds });
  }, [activeSetlist, updateSetlist]);

  // Ensure activeSetlistId is valid
  useEffect(() => {
    if (!setlists.find(s => s.id === activeSetlistId) && setlists.length > 0) {
        setActiveSetlistId(setlists[0].id);
    }
  }, [setlists, activeSetlistId]);

  return (
    <SongContext.Provider value={{ songs, setlists, activeSongId, activeSong, activeSetlist, setActiveSetlistId, selectSong, saveSong, updateSong, saveSetlist, handleRemoveSongFromSetlist }}>
      {children}
    </SongContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongContext);
  if (context === undefined) {
    throw new Error('useSongs must be used within a SongProvider');
  }
  return context;
};

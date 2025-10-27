



import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useMixer } from './MixerContext';
import { Track } from '../types';

type AudioLoadingState = 'idle' | 'loading' | 'ready' | 'error';
interface LoadingProgress {
  overall: number;
  tracks: Record<string, number>; // trackId: percentage
}

interface LoopState {
    start: number; // in seconds
    end: number; // in seconds
    enabled: boolean;
}

interface PlaybackContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioLoadingState: AudioLoadingState;
  loadingProgress: LoadingProgress;
  loop: LoopState;
  trackLoadErrors: Record<string, Error>;
  updateLoop: (updates: Partial<LoopState>) => void;
  handlePlayPause: () => Promise<void>;
  handleStop: () => Promise<void>;
  handleSeek: (time: number) => void;
  initAudioContext: () => Promise<void>;
  audioContext: AudioContext | null;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTracks } = useMixer();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [audioLoadingState, setAudioLoadingState] = useState<AudioLoadingState>('idle');
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ overall: 0, tracks: {} });
  const [loop, setLoop] = useState<LoopState>({ start: 0, end: 0, enabled: false });
  const [trackLoadErrors, setTrackLoadErrors] = useState<Record<string, Error>>({});

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<Map<string, { gainNode: GainNode; volumeNode: GainNode }>>(new Map());
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const playbackStartTimeRef = useRef(0);
  const startOffsetRef = useRef(0);
  
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
            setAudioLoadingState('error');
        }
    }
    if (audioContextRef.current?.state === 'suspended') {
        try {
            await audioContextRef.current.resume();
        } catch(e) {
            console.error("Failed to resume AudioContext:", e);
        }
    }
  }, []);

  const playAudio = useCallback(() => {
      if (audioLoadingState !== 'ready' || !audioContextRef.current || !currentTracks) return;

      const ac = audioContextRef.current;
      if (ac.state === 'suspended') return; // Should not happen with new logic, but as a safeguard.

      activeSourceNodesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
      activeSourceNodesRef.current = [];

      const startTime = ac.currentTime;
      playbackStartTimeRef.current = startTime;
      
      currentTracks.forEach(track => {
          const buffer = audioBuffersRef.current.get(track.id);
          const nodes = audioNodesRef.current.get(track.id);
          if (buffer && nodes) {
              const source = ac.createBufferSource();
              source.buffer = buffer;
              source.connect(nodes.gainNode);
              source.start(startTime, startOffsetRef.current);
              activeSourceNodesRef.current.push(source);
          }
      });
      setIsPlaying(true);
  }, [currentTracks, audioLoadingState]);

  const pauseAudio = useCallback(() => {
    if (!audioContextRef.current || activeSourceNodesRef.current.length === 0) return;
    activeSourceNodesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    activeSourceNodesRef.current = [];

    const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
    startOffsetRef.current = Math.min(startOffsetRef.current + elapsed, duration);

    setIsPlaying(false);
  }, [duration]);

  const handleSeek = useCallback((time: number) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      pauseAudio();
    }
    startOffsetRef.current = time;
    setCurrentTime(time);
    if (wasPlaying) {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  useEffect(() => {
    // This is an async IIFE (Immediately Invoked Function Expression)
    // It's a way to run async code inside a non-async useEffect hook.
    (async () => {
        if (currentTracks.length === 0) {
            setAudioLoadingState('idle');
            setLoadingProgress({ overall: 0, tracks: {} });
            setDuration(0);
            return;
        }

        await initAudioContext(); // Ensure context is running BEFORE any loading
        if (!audioContextRef.current) return;

        setAudioLoadingState('loading');
        setLoadingProgress({ overall: 0, tracks: currentTracks.reduce((acc, track) => ({...acc, [track.id]: 0 }), {}) });
        setTrackLoadErrors({});
        
        audioNodesRef.current.forEach(nodes => {
            nodes.gainNode.disconnect();
            nodes.volumeNode.disconnect();
        });
        audioNodesRef.current.clear();
        currentTracks.forEach(track => {
            const gainNode = audioContextRef.current!.createGain();
            const volumeNode = audioContextRef.current!.createGain();
            gainNode.connect(volumeNode);
            volumeNode.connect(audioContextRef.current!.destination);
            audioNodesRef.current.set(track.id, { gainNode, volumeNode });
        });

        const loadPromises = currentTracks.map(async (track) => {
            try {
                const response = await fetch(track.url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                if (!response.body) throw new Error('Response body is null');
                
                const reader = response.body.getReader();
                const contentLength = +(response.headers.get('Content-Length') || 0);
                let receivedLength = 0;
                const chunks: Uint8Array[] = [];

                while(true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    receivedLength += value.length;

                    if (contentLength > 0) {
                        const progress = (receivedLength / contentLength) * 100;
                        setLoadingProgress(prev => {
                            const newTracksProgress = { ...prev.tracks, [track.id]: progress };
                            const totalProgress = Object.values(newTracksProgress).reduce((sum, p) => sum + p, 0);
                            const overall = currentTracks.length > 0 ? totalProgress / currentTracks.length : 0;
                            return { tracks: newTracksProgress, overall };
                        });
                    }
                }
                
                const blob = new Blob(chunks);
                const arrayBuffer = await blob.arrayBuffer();
                const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
                return { track, audioBuffer };
            } catch (err) {
                console.error(`Failed to load track ${track.name} from ${track.url}:`, err);
                throw err;
            }
        });

        const results = await Promise.allSettled(loadPromises);
        const newErrors: Record<string, Error> = {};
        let maxDuration = 0;
        audioBuffersRef.current.clear();

        results.forEach((result, index) => {
            const track = currentTracks[index];
            if (result.status === 'fulfilled') {
                const { audioBuffer } = result.value;
                audioBuffersRef.current.set(track.id, audioBuffer);
                if (audioBuffer.duration > maxDuration) {
                    maxDuration = audioBuffer.duration;
                }
            } else { // 'rejected'
                newErrors[track.id] = result.reason as Error;
            }
        });

        setTrackLoadErrors(newErrors);

        if (audioBuffersRef.current.size === 0 && currentTracks.length > 0) {
            setAudioLoadingState('error');
            return;
        }

        setDuration(maxDuration);
        setLoop({ start: 0, end: maxDuration / 4, enabled: false });
        setAudioLoadingState('ready');
        setLoadingProgress(prev => ({ ...prev, overall: 100 }));
    })();

    return () => {
      currentTracks.forEach(track => {
        if (track.url.startsWith('blob:')) {
          URL.revokeObjectURL(track.url);
        }
      });
    };
  }, [currentTracks, initAudioContext]);

  useEffect(() => {
      if (!audioContextRef.current || !currentTracks) return;
      const isAnyTrackSoloed = currentTracks.some(t => t.isSoloed);
      currentTracks.forEach(track => {
          const nodes = audioNodesRef.current.get(track.id);
          if (nodes) {
              let finalVolume = track.volume;
              if (track.isMuted) finalVolume = 0;
              if (isAnyTrackSoloed && !track.isSoloed) finalVolume = 0;
              
              nodes.gainNode.gain.setValueAtTime(track.gain, audioContextRef.current.currentTime);
              nodes.volumeNode.gain.setValueAtTime(finalVolume, audioContextRef.current.currentTime);
          }
      });
  }, [currentTracks]);

  useEffect(() => {
    let animationFrameId: number;
    if (isPlaying) {
      const animate = () => {
        if (!audioContextRef.current) return;
        const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
        const newTime = startOffsetRef.current + elapsed;
        
        if (loop.enabled && newTime >= loop.end) {
            handleSeek(loop.start);
            return; // Exit animation frame, handleSeek will restart it
        }

        setCurrentTime(Math.min(newTime, duration));

        if (newTime >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
          startOffsetRef.current = 0;
        } else {
            animationFrameId = requestAnimationFrame(animate);
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, duration, loop, handleSeek]);

  const handlePlayPause = async () => {
    await initAudioContext();
    if (currentTime >= duration) {
        await handleStop();
    }
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
  };
  
  const handleStop = useCallback(async () => {
    if (isPlaying) {
        pauseAudio();
    }
    setCurrentTime(0);
    startOffsetRef.current = 0;
  }, [isPlaying, pauseAudio]);

  useEffect(() => {
    handleStop();
  }, [currentTracks, handleStop]);
  
  const updateLoop = (updates: Partial<LoopState>) => {
    setLoop(prev => ({ ...prev, ...updates }));
  };

  return (
    <PlaybackContext.Provider value={{ 
        isPlaying, currentTime, duration, audioLoadingState, 
        loadingProgress, handlePlayPause, handleStop, loop, updateLoop, handleSeek, trackLoadErrors,
        initAudioContext, audioContext: audioContextRef.current
    }}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};

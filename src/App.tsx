// FIX: Import `useRef` from React.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Song, Setlist, Track } from './types';
import { Header } from './components/InputPanel';
import { WaveformDisplay } from './components/ContentCard';
// FIX: Import `ChannelStrip` from `./components/Mixer`.
import { Mixer, ChannelStrip } from './components/Mixer';
import { Icons } from './components/Icons';
import { AddSongModal } from './components/AddSongModal';
import { AiSetlistModal } from './components/AiSetlistModal';
import { DriveAuthModal } from './components/DriveAuthModal';
import { SongProvider, useSongs } from './contexts/SongContext';
import { MixerProvider, useMixer } from './contexts/MixerContext';
import { PlaybackProvider, usePlayback } from './contexts/PlaybackContext';
import { DriveAuthProvider, useDriveAuth } from './contexts/DriveAuthContext';
import { getSongStructureFromGemini } from './services/geminiService';

const LibraryPanel: React.FC<{
  onAddSong: () => void;
  onAiCreateSetlist: () => void;
}> = ({ onAddSong, onAiCreateSetlist }) => {
  const { setlists, songs, activeSongId, selectSong, activeSetlist, setActiveSetlistId, handleRemoveSongFromSetlist } = useSongs();
  const { isDriveConnected, connectDrive, disconnectDrive } = useDriveAuth();
  const [openMenuSongId, setOpenMenuSongId] = useState<number | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const songsInSetlist = useMemo(() => {
    if (!activeSetlist) return [];
    const songIdSet = new Set(activeSetlist.songIds);
    return songs.filter(song => songIdSet.has(song.id));
  }, [songs, activeSetlist]);

  const handleToggleMenu = (songId: number) => {
    setOpenMenuSongId(prevId => prevId === songId ? null : songId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuSongId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-audio-mid rounded-lg flex flex-col h-full">
      <div className="p-2 border-b border-audio-border flex justify-between items-center">
        <div className="flex-grow min-w-0">
            <select 
                value={activeSetlist?.id || ''}
                onChange={(e) => setActiveSetlistId(Number(e.target.value))}
                className="bg-transparent font-bold text-sm focus:outline-none focus:ring-0 border-0 w-full truncate"
                aria-label="Select Setlist"
            >
                {setlists.map(setlist => (
                    <option key={setlist.id} value={setlist.id}>{setlist.name}</option>
                ))}
                {setlists.length === 0 && <option value="">No Setlists</option>}
            </select>
        </div>
        <div className="flex gap-2">
           <button onClick={onAiCreateSetlist} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 flex items-center gap-1.5">
             <Icons.Sparkles size={14} /> AI Setlist
          </button>
        </div>
      </div>
      <ul className="flex-grow overflow-y-auto">
        {songsInSetlist.map((song, index) => (
          <li
            key={song.id}
            onClick={() => selectSong(song.id)}
            className={`relative flex items-center gap-3 px-2 py-3 cursor-pointer border-l-4 ${
              activeSongId === song.id
                ? 'border-audio-cyan bg-audio-accent/10'
                : 'border-transparent hover:bg-audio-light/50'
            }`}
          >
            <span className="text-audio-text-disabled w-4 text-center text-sm">{index + 1}</span>
            <img src={song.artworkUrl} alt={song.title} className="w-8 h-8 rounded-sm" />
            <div className="flex-grow">
              <p className="text-sm font-semibold text-audio-text-light">{song.title}</p>
              <p className="text-xs text-audio-text-disabled">{song.artist}{song.version && ` (${song.version})`}</p>
            </div>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); handleToggleMenu(song.id); }} 
                className="text-audio-text-disabled hover:text-audio-text-light p-1" 
                aria-label={`More options for ${song.title}`}
              >
                <Icons.MoreHorizontal size={18} />
              </button>
              {openMenuSongId === song.id && (
                <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-audio-dark border border-audio-border rounded-md shadow-lg z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSongFromSetlist(song.id);
                      setOpenMenuSongId(null);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-audio-red hover:bg-audio-red/10 flex items-center gap-2"
                  >
                    <Icons.Trash size={14} /> Remove from Setlist
                  </button>
                </div>
              )}
            </div>
            <span className="hidden lg:inline-block text-sm font-bold w-8 text-center">{song.key}</span>
            <span className="hidden lg:inline-block text-sm text-audio-text-dark w-10 text-center">{song.bpm}</span>
            <button className="text-audio-text-disabled hover:text-audio-text-light" aria-label={`Reorder ${song.title}`}>
              <Icons.Menu />
            </button>
          </li>
        ))}
      </ul>
      <div className="p-2 border-t border-audio-border flex justify-between items-center text-sm">
        <button className="flex items-center gap-2 text-audio-accent hover:text-audio-cyan" onClick={onAddSong}><Icons.Plus size={16}/> Add Song</button>
        {isDriveConnected ? (
          <button onClick={disconnectDrive} className="text-xs px-3 py-1.5 bg-green-800/50 text-green-300 rounded-md hover:bg-green-800/80 flex items-center gap-1.5">
            <Icons.Cloud size={14} /> Connected
          </button>
        ) : (
          <button onClick={connectDrive} className="text-xs px-3 py-1.5 bg-audio-light hover:bg-audio-border rounded-md flex items-center gap-1.5">
            <Icons.CloudOff size={14} /> Connect to Drive
          </button>
        )}
      </div>
    </div>
  );
};

const PadPlayer: React.FC = () => {
    const { initAudioContext, audioContext } = usePlayback();
    
    const keysTop = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'];
    const keysBottom = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    const [padTrack, setPadTrack] = useState<Track>({
      id: 'ambient-pad',
      name: 'Ambient Pad',
      subName: 'Continuous Loop',
      url: '',
      volume: 0.5,
      gain: 1,
      isMuted: false,
      isSoloed: false,
      color: 'cyan',
    });
    
    const [isPadPlayerOn, setIsPadPlayerOn] = useState(false);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [padBuffer, setPadBuffer] = useState<AudioBuffer | null>(null);
    const [isPadLoading, setIsPadLoading] = useState(false);

    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const PAD_SAMPLE_URL = 'https://cdn.glitch.global/2d6f2122-cda3-48f8-b119-1221086b53e8/ambient_pad_loop_c.wav?v=1684341981053';
    const BASE_KEY_MIDI = 60; // C4 is our sample's base key

    const keyMidiMap: { [key: string]: number } = {
        'C': 60, 'Db': 61, 'D': 62, 'Eb': 63, 'E': 64, 'F': 65,
        'Gb': 66, 'G': 67, 'Ab': 68, 'A': 69, 'Bb': 70, 'B': 71
    };

    const initAndLoadSample = useCallback(async () => {
        if (!audioContext) await initAudioContext();
        if (!audioContext || padBuffer || isPadLoading) return;
        
        // Setup GainNode on first load
        if (!gainNodeRef.current) {
            const gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            gainNodeRef.current = gainNode;
        }

        setIsPadLoading(true);
        try {
            const response = await fetch(PAD_SAMPLE_URL);
            const arrayBuffer = await response.arrayBuffer();
            const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
            setPadBuffer(decodedBuffer);
        } catch (error) {
            console.error("Failed to load pad sample:", error);
        } finally {
            setIsPadLoading(false);
        }
    }, [audioContext, padBuffer, isPadLoading, initAudioContext]);

    const stopPad = useCallback((withFadeOut = false) => {
        if (gainNodeRef.current && audioContext && withFadeOut) {
            gainNodeRef.current.gain.cancelScheduledValues(audioContext.currentTime);
            gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.0);
            setTimeout(() => {
                if (sourceNodeRef.current) {
                    try { sourceNodeRef.current.stop(); } catch (e) {}
                    sourceNodeRef.current.disconnect();
                    sourceNodeRef.current = null;
                }
            }, 1000);
        } else if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch(e) {}
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        setActiveKey(null);
    }, [audioContext]);

    const playPad = useCallback((key: string) => {
        const startNewPad = () => {
            const context = audioContext;
            const gainNode = gainNodeRef.current;
            if (!context || !gainNode || !padBuffer) return;

            const source = context.createBufferSource();
            source.buffer = padBuffer;
            source.loop = true;
            
            const targetMidi = keyMidiMap[key];
            const semitoneShift = targetMidi - BASE_KEY_MIDI;
            source.playbackRate.value = Math.pow(2, semitoneShift / 12);

            gainNode.gain.cancelScheduledValues(context.currentTime);
            gainNode.gain.setValueAtTime(0, context.currentTime);
            const targetVolume = padTrack.isMuted ? 0 : padTrack.volume;
            gainNode.gain.linearRampToValueAtTime(targetVolume, context.currentTime + 1.0);

            source.connect(gainNode);
            source.start();

            sourceNodeRef.current = source;
            setActiveKey(key);
        };

        if (sourceNodeRef.current) {
            if (gainNodeRef.current && audioContext) {
                gainNodeRef.current.gain.cancelScheduledValues(audioContext.currentTime);
                gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
                setTimeout(() => {
                    if (sourceNodeRef.current) {
                        try { sourceNodeRef.current.stop(); } catch (e) {}
                        sourceNodeRef.current.disconnect();
                        sourceNodeRef.current = null;
                    }
                    startNewPad();
                }, 500);
            }
        } else {
            startNewPad();
        }
    }, [audioContext, padBuffer, padTrack.isMuted, padTrack.volume]);
    
    const handleKeyClick = async (key: string) => {
        if (!isPadPlayerOn || isPadLoading || !padBuffer) return;
        await initAudioContext();
        if (activeKey === key) {
            stopPad(true);
        } else {
            playPad(key);
        }
    };
    
    const handlePowerClick = () => {
        const turningOn = !isPadPlayerOn;
        setIsPadPlayerOn(turningOn);
        if (turningOn) {
            initAndLoadSample();
        } else {
            stopPad(true);
        }
    };
    
    useEffect(() => {
        if (gainNodeRef.current && audioContext && isPadPlayerOn && activeKey) {
            const targetVolume = padTrack.isMuted ? 0 : padTrack.volume;
            gainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + 0.1);
        }
    }, [padTrack.volume, padTrack.isMuted, isPadPlayerOn, activeKey, audioContext]);
    
    useEffect(() => {
      // Cleanup function to stop pad on component unmount
      return () => {
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch(e) {}
        }
      }
    }, []);

    return (
        <div className="bg-audio-mid rounded-lg p-3">
            <div className="flex gap-2">
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                        <button 
                            aria-label="Toggle ambient pad" 
                            className={isPadPlayerOn ? 'text-audio-cyan' : 'text-audio-text-disabled'}
                            onClick={handlePowerClick}
                        >
                            <Icons.Power />
                        </button>
                        <img src="https://i.pravatar.cc/40?img=7" alt="Ambient Pad" className="w-8 h-8 rounded-sm" />
                        <div>
                            <p className="text-sm font-semibold">{padTrack.name}</p>
                            <p className="text-xs text-audio-text-disabled">{ isPadLoading ? "Loading Pad..." : padTrack.subName}</p>
                        </div>
                    </div>
                    <div className="relative">
                        {/* White keys */}
                        <div className="flex justify-between">
                            {keysBottom.map(key => (
                                <button
                                    key={key}
                                    onClick={() => handleKeyClick(key)}
                                    className={`w-[13.5%] h-24 rounded-md text-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-end justify-center pb-2 ${
                                        activeKey === key
                                            ? 'bg-audio-cyan text-black'
                                            : 'bg-audio-light hover:bg-audio-border'
                                    }`}
                                    disabled={!isPadPlayerOn || isPadLoading}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>

                        {/* Black keys */}
                        <div className="absolute top-0 left-0 w-full h-14 pointer-events-none">
                            {(() => {
                                const blackKeyPositions: { [key: string]: string } = {
                                    'Db': '10.25%', 'Eb': '24.75%', 'Gb': '53.25%', 'Ab': '67.75%', 'Bb': '82.25%'
                                };
                                return keysTop.map(key => (
                                    <button
                                        key={key}
                                        onClick={(e) => { e.stopPropagation(); handleKeyClick(key); }}
                                        className={`absolute top-0 w-[9%] h-full rounded-b-md text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto ${
                                            activeKey === key
                                                ? 'bg-audio-cyan text-black'
                                                : 'bg-black border border-t-0 border-audio-border hover:bg-audio-light'
                                        }`}
                                        style={{ left: blackKeyPositions[key] }}
                                        disabled={!isPadPlayerOn || isPadLoading}
                                    >
                                        {key}
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
                <div className="w-12 flex-shrink-0">
                    <ChannelStrip 
                      track={padTrack}
                      onUpdate={(id, updates) => setPadTrack(prev => ({ ...prev, ...updates }))}
                      isCompact={true}
                    />
                </div>
            </div>
        </div>
    );
};


const AppLayout: React.FC = () => {
  const { songs, activeSong, saveSong, updateSong, saveSetlist } = useSongs();
  const { currentTracks, handleTrackUpdate, undo, redo, canUndo, canRedo } = useMixer();
  const { isPlaying, currentTime, duration, audioLoadingState, handlePlayPause, handleStop, loadingProgress, loop, updateLoop, handleSeek, trackLoadErrors, initAudioContext } = usePlayback();
  const { isDriveConnected } = useDriveAuth();

  const [bpm, setBpm] = useState<number>(activeSong?.bpm || 120);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isAiSetlistModalOpen, setIsAiSetlistModalOpen] = useState(false);
  const [isStructureLoading, setIsStructureLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'main' | 'side'>('main');
  
  useEffect(() => {
    if (activeSong) {
      setBpm(activeSong.bpm);
      if (!activeSong.structure && activeSong.title && activeSong.artist) {
          const fetchStructure = async () => {
              setIsStructureLoading(true);
              try {
                  const structure = await getSongStructureFromGemini(activeSong.title, activeSong.artist);
                  if (structure) {
                      updateSong(activeSong.id, { structure });
                  }
              } catch (error) {
                  console.error("Failed to fetch song structure:", error);
              } finally {
                  setIsStructureLoading(false);
              }
          };
          fetchStructure();
      }
    }
  }, [activeSong, updateSong]);
  
  const handleBpmChange = (newBpm: number) => setBpm(newBpm);
  
  const handleSaveSong = async (newSongData: Parameters<typeof saveSong>[0]) => {
      await initAudioContext();
      saveSong(newSongData);
      setIsAddSongModalOpen(false);
  };

  const handleSaveSetlist = (name: string, songIds: number[]) => {
    saveSetlist(name, songIds);
    setIsAiSetlistModalOpen(false);
  };
  
  const toggleMobileView = () => setMobileView(prev => prev === 'main' ? 'side' : 'main');

  return (
    <>
      <div className="h-screen w-screen bg-audio-dark flex flex-col p-2 sm:p-4 gap-2 sm:gap-4">
        <Header 
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          currentTime={currentTime}
          duration={duration}
          bpm={bpm}
          onBpmChange={handleBpmChange}
          songKey={activeSong?.key || ''}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          isAudioReady={audioLoadingState === 'ready'}
          audioLoading={audioLoadingState === 'loading'}
          loadingProgress={loadingProgress}
          loop={loop}
          onUpdateLoop={updateLoop}
          mobileView={mobileView}
          onToggleMobileView={toggleMobileView}
        />
        <main className="flex-grow grid grid-cols-12 gap-4 min-h-0">
          <div className={`${mobileView === 'main' ? 'flex' : 'hidden'} sm:flex col-span-12 sm:col-span-8 flex-col gap-4 min-h-0`}>
            <WaveformDisplay 
              currentTime={currentTime} 
              duration={duration} 
              sections={activeSong?.structure} 
              isLoading={isStructureLoading}
              loop={loop}
              onUpdateLoop={updateLoop}
              onSeek={handleSeek}
            />
            <Mixer 
              tracks={currentTracks || []} 
              onTrackUpdate={handleTrackUpdate} 
              loadingProgress={loadingProgress}
              trackLoadErrors={trackLoadErrors}
            />
          </div>
          
          <div className={`${mobileView === 'side' ? 'flex' : 'hidden'} sm:flex col-span-12 sm:col-span-4 flex-col gap-4 min-h-0`}>
            <div className="flex-grow min-h-0">
              <LibraryPanel 
                onAddSong={() => setIsAddSongModalOpen(true)}
                onAiCreateSetlist={() => setIsAiSetlistModalOpen(true)}
              />
            </div>
            <PadPlayer />
          </div>
        </main>
      </div>
      <AddSongModal 
        isOpen={isAddSongModalOpen}
        onClose={() => setIsAddSongModalOpen(false)}
        onSave={handleSaveSong}
        isDriveConnected={isDriveConnected}
      />
      <AiSetlistModal
        isOpen={isAiSetlistModalOpen}
        onClose={() => setIsAiSetlistModalOpen(false)}
        onSave={handleSaveSetlist}
        songs={songs}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <SongProvider>
      <MixerProvider>
        <PlaybackProvider>
          <DriveAuthProvider>
            <AppLayout />
          </DriveAuthProvider>
        </PlaybackProvider>
      </MixerProvider>
    </SongProvider>
  );
};

export default App;





import React, { useState, useRef } from 'react';
import { Track, Song, TrackColor } from '../types';
import { Icons } from './Icons';
import { Spinner } from './Spinner';

export type NewSongData = Omit<Song, 'id' | 'tracks' | 'artworkUrl'> & { tracks: Omit<Track, 'id'| 'url'>[] } & { files: File[]; saveToCloud: boolean; };

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewSongData) => Promise<void>;
  isDriveConnected: boolean;
}

const colorOptions: TrackColor[] = ['slate', 'red', 'orange', 'amber', 'lime', 'green', 'emerald', 'cyan', 'sky', 'indigo', 'violet', 'fuchsia', 'rose'];

const colorMap: { [key in TrackColor]: string } = {
    slate: 'bg-slate-500', red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500',
    lime: 'bg-lime-500', green: 'bg-green-500', emerald: 'bg-emerald-500', cyan: 'bg-cyan-500',
    sky: 'bg-sky-500', indigo: 'bg-indigo-500', violet: 'bg-violet-500', fuchsia: 'bg-fuchsia-500',
    rose: 'bg-rose-500',
};

export const AddSongModal: React.FC<AddSongModalProps> = ({ isOpen, onClose, onSave, isDriveConnected }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [bpm, setBpm] = useState(120);
  const [songKey, setSongKey] = useState('C');
  const [files, setFiles] = useState<File[]>([]);
  const [tracks, setTracks] = useState<Omit<Track, 'id' | 'url'>[]>([]);
  const [openColorPickerIndex, setOpenColorPickerIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setTitle(''); setArtist(''); setBpm(120); setSongKey('C'); setFiles([]); setTracks([]); setIsUploading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      const newTracks = selectedFiles.map((file, index) => {
        const fileName = file.name;
        const lastDotIndex = fileName.lastIndexOf('.');
        const trackName = (lastDotIndex > 0) ? fileName.substring(0, lastDotIndex) : fileName;
        
        return {
          name: trackName,
          subName: '',
          volume: 0.8,
          gain: 0.5,
          isMuted: false,
          isSoloed: false,
          color: colorOptions[(tracks.length + index) % colorOptions.length],
        };
      });
      setTracks(prevTracks => [...prevTracks, ...newTracks]);
    }
    if (event.target) {
        event.target.value = '';
    }
  };
  
  const handleTrackUpdate = (index: number, updates: Partial<Omit<Track, 'id' | 'url'>>) => {
      setTracks(currentTracks => currentTracks.map((t, i) => i === index ? { ...t, ...updates } : t));
  };

  const handleRemoveTrack = (indexToRemove: number) => {
    setFiles(currentFiles => currentFiles.filter((_, index) => index !== indexToRemove));
    setTracks(currentTracks => currentTracks.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSave = async () => {
      if (!title || files.length === 0) {
          alert('Please provide a title and at least one audio track.');
          return;
      }
      
      if (isDriveConnected) {
        setIsUploading(true);
        // Simulate upload delay
        // TODO: Replace this with actual Google Drive API upload logic
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      await onSave({ title, artist, bpm, key: songKey, tracks, files, saveToCloud: isDriveConnected });
      resetState();
      onClose();
  }
  
  const handleClose = () => {
    resetState();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-audio-dark/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-audio-mid rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-audio-border flex justify-between items-center">
          <h2 className="text-lg font-bold">Add New Song</h2>
          <button onClick={handleClose} className="p-2 hover:bg-audio-light rounded-md" aria-label="Close add song dialog"><Icons.Close /></button>
        </header>

        <main className="p-6 flex-grow overflow-y-auto relative">
          {isUploading && (
              <div className="absolute inset-0 bg-audio-mid/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-b-lg">
                  <Spinner />
                  <p className="mt-4 font-semibold">Uploading to Google Drive...</p>
                  <p className="text-sm text-audio-text-disabled">(This is a simulation)</p>
              </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="audio/*" className="hidden" />
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-audio-border rounded-lg p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">Upload Your Tracks</h3>
                <p className="text-audio-text-disabled mb-4">Select the audio files (stems) for your song.</p>
                <button onClick={() => fileInputRef.current?.click()} className="bg-audio-accent text-white font-bold py-2 px-4 rounded-md hover:opacity-90">
                    Select Audio Files
                </button>
            </div>
          ) : (
            <div className="space-y-6">
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-audio-text-dark mb-1">Song Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-audio-light border border-audio-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-audio-accent" />
                    </div>
                    <div>
                        <label htmlFor="artist" className="block text-sm font-medium text-audio-text-dark mb-1">Artist</label>
                        <input type="text" id="artist" value={artist} onChange={e => setArtist(e.target.value)} className="w-full bg-audio-light border border-audio-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-audio-accent" />
                    </div>
                    <div>
                        <label htmlFor="bpm" className="block text-sm font-medium text-audio-text-dark mb-1">BPM</label>
                        <input type="number" id="bpm" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="w-full bg-audio-light border border-audio-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-audio-accent" />
                    </div>
                     <div>
                        <label htmlFor="key" className="block text-sm font-medium text-audio-text-dark mb-1">Key</label>
                        <input type="text" id="key" value={songKey} onChange={e => setSongKey(e.target.value)} className="w-full bg-audio-light border border-audio-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-audio-accent" />
                    </div>
                </fieldset>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Tracks ({tracks.length})</h3>
                        <button onClick={() => fileInputRef.current?.click()} className="text-sm px-3 py-1.5 bg-audio-light text-audio-text-dark rounded-md hover:bg-audio-border flex items-center gap-1">
                            <Icons.Plus /> Add More
                        </button>
                    </div>
                    <div className="space-y-2">
                        {tracks.map((track, index) => (
                            <div key={index} className="flex items-center gap-3 bg-audio-light p-2 rounded-md">
                               <div className="relative">
                                  <button 
                                    onClick={() => setOpenColorPickerIndex(openColorPickerIndex === index ? null : index)}
                                    className={`w-6 h-6 rounded-md ${colorMap[track.color]}`}
                                    aria-label="Change track color"
                                  ></button>
                                  {openColorPickerIndex === index && (
                                    <div className="absolute z-10 mt-1 grid grid-cols-5 gap-1 bg-audio-dark p-1 rounded-md shadow-lg">
                                        {colorOptions.map(color => (
                                            <button 
                                              key={color} 
                                              onClick={() => {
                                                handleTrackUpdate(index, {color});
                                                setOpenColorPickerIndex(null);
                                              }} 
                                              className={`w-6 h-6 rounded ${colorMap[color]}`}
                                              aria-label={`Set color to ${color}`}
                                            ></button>
                                        ))}
                                    </div>
                                  )}
                               </div>
                                <input 
                                    type="text" 
                                    value={track.name}
                                    onChange={e => handleTrackUpdate(index, { name: e.target.value })}
                                    className="flex-grow bg-transparent focus:outline-none"
                                />
                                <span className="text-xs text-audio-text-disabled truncate">{files[index].name}</span>
                                <button
                                    onClick={() => handleRemoveTrack(index)}
                                    className="ml-2 p-1 text-audio-text-disabled hover:text-audio-red rounded-md focus:outline-none focus:ring-2 focus:ring-audio-red"
                                    aria-label={`Remove track ${track.name}`}
                                >
                                    <Icons.Trash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                 {isDriveConnected &&
                    <div className="mt-6 p-3 bg-green-900/30 border border-green-700/50 rounded-md flex items-center gap-3">
                        <Icons.Cloud className="text-green-400 flex-shrink-0" />
                        <div>
                            <span className="font-semibold text-green-300">Google Drive Connected</span>
                            <p className="text-xs text-green-400/70">New songs will be saved to your drive, allowing them to persist across sessions.</p>
                        </div>
                    </div>
                }
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-audio-border flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 bg-audio-light rounded-md hover:bg-audio-border">Cancel</button>
          <button onClick={handleSave} disabled={files.length === 0 || !title} className="px-4 py-2 bg-audio-accent text-white rounded-md hover:opacity-90 disabled:bg-audio-light/50 disabled:cursor-not-allowed">
            {isDriveConnected ? 'Save to Drive' : 'Save Locally'}
          </button>
        </footer>
      </div>
    </div>
  );
};

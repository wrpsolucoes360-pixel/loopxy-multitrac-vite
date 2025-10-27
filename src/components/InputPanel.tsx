

import React from 'react';
import { Icons } from './Icons';
import { useDriveAuth } from '../contexts/DriveAuthContext';


interface HeaderProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  currentTime: number;
  duration: number;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  songKey: string;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isAudioReady: boolean;
  audioLoading: boolean;
  loadingProgress: { overall: number; tracks: Record<string, number> };
  loop: { start: number; end: number; enabled: boolean };
  onUpdateLoop: (updates: Partial<{ start: number; end: number; enabled: boolean }>) => void;
  mobileView: 'main' | 'side';
  onToggleMobileView: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const Header: React.FC<HeaderProps> = ({ 
    isPlaying, onPlayPause, onStop, currentTime, duration, bpm, 
    onBpmChange, songKey, onUndo, onRedo, canUndo, canRedo, 
    isAudioReady, audioLoading, 
    loadingProgress, loop, onUpdateLoop,
    mobileView, onToggleMobileView
}) => {
  const { isDriveConnected, userProfile } = useDriveAuth();

  return (
    <header className="bg-audio-mid rounded-lg p-2 flex items-center justify-between gap-x-2 sm:gap-x-4 text-sm shadow-md">
      {/* Mobile Left Group */}
      <div className="flex sm:hidden items-center">
        <button
          onClick={onToggleMobileView}
          className="p-2 hover:bg-audio-light rounded-md"
          aria-label={mobileView === 'main' ? 'Show song library and pads' : 'Show mixer and waveform'}
        >
          {mobileView === 'main' ? <Icons.Library /> : <Icons.Grid />}
        </button>
        <div className="flex items-center border-l border-audio-border ml-2 pl-1">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Undo"><Icons.Undo /></button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Redo"><Icons.Redo /></button>
        </div>
      </div>

      {/* Desktop Left Group */}
      <div className="hidden sm:flex items-center gap-2">
        <button className="bg-audio-light px-4 py-2 rounded-md font-bold border border-audio-border hover:border-audio-accent">MASTER</button>
        <div className="flex items-center border-l border-audio-border ml-2 pl-2">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Undo"><Icons.Undo /></button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Redo"><Icons.Redo /></button>
        </div>
      </div>

      {/* Center Group */}
      <div className="flex-grow flex items-center justify-center gap-x-2 sm:gap-x-4">
        <div className="hidden sm:flex items-center">
            <button disabled={!isAudioReady} className="p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Rewind"><Icons.Rewind /></button>
            <button 
                onClick={onPlayPause} 
                disabled={!isAudioReady}
                className="p-2 rounded-md text-audio-cyan disabled:text-audio-text-disabled disabled:cursor-not-allowed mx-1"
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {audioLoading ? (
                <div className="flex items-center justify-center w-8 h-8 font-mono text-xs text-audio-cyan">
                    {`${Math.round(loadingProgress.overall)}%`}
                </div>
                ) : (isPlaying ? <Icons.Pause size={32} /> : <Icons.Play size={32} />)}
            </button>
            <button onClick={onStop} disabled={!isAudioReady} className="p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Stop"><Icons.Stop /></button>
            <button disabled={!isAudioReady} className="p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Fast forward"><Icons.FastForward /></button>
        </div>
         <div className="flex sm:hidden items-center">
             <button 
                onClick={onPlayPause} 
                disabled={!isAudioReady}
                className="p-1 rounded-md text-audio-cyan disabled:text-audio-text-disabled disabled:cursor-not-allowed"
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                 {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
             <button onClick={onStop} disabled={!isAudioReady} className="p-1 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent" aria-label="Stop"><Icons.Stop /></button>
        </div>
        <div className="flex items-center gap-4 font-mono text-lg text-audio-text-light">
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-audio-text-dark font-mono">
            <span className="font-bold w-24 text-center">{bpm} BPM</span>
            <span className="font-bold">{songKey}</span>
        </div>
        <div className="hidden sm:flex items-center">
            <button 
                onClick={() => onUpdateLoop({ enabled: !loop.enabled })}
                disabled={!isAudioReady}
                className={`p-2 hover:bg-audio-light rounded-md disabled:text-audio-text-disabled disabled:hover:bg-transparent ${loop.enabled ? 'text-audio-cyan' : 'text-audio-text-dark'}`}
                aria-label="Toggle loop"
                aria-pressed={loop.enabled}
                title="Toggle Loop"
            >
                <Icons.Repeat />
            </button>
        </div>
      </div>
      
      {/* Right Group */}
      <div className="flex items-center gap-1 sm:gap-2">
         {isDriveConnected && userProfile && (
          <div className="hidden sm:flex items-center gap-2 p-1 pr-3 bg-audio-light rounded-full">
            <img src={userProfile.picture} alt="User" className="w-6 h-6 rounded-full"/>
            <span className="text-xs font-semibold text-audio-text-light">{userProfile.name}</span>
          </div>
        )}
        <button className="p-2 hover:bg-audio-light rounded-md" aria-label="General settings"><Icons.Settings /></button>
      </div>
    </header>
  );
};

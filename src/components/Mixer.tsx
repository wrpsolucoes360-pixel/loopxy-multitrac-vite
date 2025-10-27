



import React, { useRef, useCallback, useEffect } from 'react';
import { Track, TrackColor } from '../types';
import { Icons } from './Icons';

interface ChannelStripProps {
  track: Track;
  onUpdate: (id: string, updates: Partial<Track>) => void;
  loadingProgress?: number;
  error?: Error;
  isCompact?: boolean;
}

const colorMap: { [key in TrackColor]: { fader: string; text: string; button: string; solo: string; } } = {
    slate:   { fader: 'bg-slate-400',   text: 'text-slate-300',   button: 'bg-slate-600',   solo: 'bg-sky-500'},
    red:     { fader: 'bg-red-500',     text: 'text-red-400',     button: 'bg-red-600',     solo: 'bg-sky-500'},
    orange:  { fader: 'bg-orange-500',  text: 'text-orange-400',  button: 'bg-orange-600',  solo: 'bg-sky-500'},
    amber:   { fader: 'bg-amber-500',   text: 'text-amber-400',   button: 'bg-amber-600',   solo: 'bg-sky-500'},
    lime:    { fader: 'bg-lime-500',    text: 'text-lime-400',    button: 'bg-lime-600',    solo: 'bg-sky-500'},
    green:   { fader: 'bg-green-500',   text: 'text-green-400',   button: 'bg-green-600',   solo: 'bg-sky-500'},
    emerald: { fader: 'bg-emerald-500', text: 'text-emerald-400', button: 'bg-emerald-600', solo: 'bg-sky-500'},
    cyan:    { fader: 'bg-cyan-500',    text: 'text-cyan-400',    button: 'bg-cyan-600',    solo: 'bg-yellow-400'},
    sky:     { fader: 'bg-sky-500',     text: 'text-sky-400',     button: 'bg-sky-600',     solo: 'bg-yellow-400'},
    indigo:  { fader: 'bg-indigo-500',  text: 'text-indigo-400',  button: 'bg-indigo-600',  solo: 'bg-yellow-400'},
    violet:  { fader: 'bg-violet-500',  text: 'text-violet-400',  button: 'bg-violet-600',  solo: 'bg-yellow-400'},
    fuchsia: { fader: 'bg-fuchsia-500', text: 'text-fuchsia-400', button: 'bg-fuchsia-600', solo: 'bg-yellow-400'},
    rose:    { fader: 'bg-rose-500',    text: 'text-rose-400',    button: 'bg-rose-600',    solo: 'bg-yellow-400'},
};

export const ChannelStrip: React.FC<ChannelStripProps> = ({ track, onUpdate, loadingProgress, error, isCompact = false }) => {
  const faderRef = useRef<HTMLDivElement>(null);
  const styles = colorMap[track.color];

  const handleVolumeChange = useCallback((e: MouseEvent) => {
    if (!faderRef.current) return;
    const rect = faderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height));
    onUpdate(track.id, { volume: percent });
  }, [track.id, onUpdate]);

  const stopDrag = useCallback(() => {
    window.removeEventListener('mousemove', handleVolumeChange);
    window.removeEventListener('mouseup', stopDrag);
  }, [handleVolumeChange]);

  const startDrag = (e: React.MouseEvent) => {
    handleVolumeChange(e.nativeEvent);
    window.addEventListener('mousemove', handleVolumeChange);
    window.addEventListener('mouseup', stopDrag);
  };
  
  const handleFaderKeyDown = (e: React.KeyboardEvent) => {
    const smallStep = 0.01;
    const largeStep = 0.1;
    const step = e.shiftKey ? largeStep : smallStep;
    let newVolume: number | null = null;

    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        newVolume = Math.min(1, track.volume + step);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        newVolume = Math.max(0, track.volume - step);
    }

    if (newVolume !== null) {
        e.preventDefault();
        onUpdate(track.id, { volume: newVolume });
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleVolumeChange);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [handleVolumeChange, stopDrag]);
  
  const isLoading = typeof loadingProgress === 'number' && loadingProgress < 100;
  const isError = !!error;

  const faderHeight = isCompact ? 'h-32' : 'h-48';
  const containerWidth = isCompact ? 'w-12' : 'w-16';

  return (
    <div className={`flex flex-col items-center gap-1 p-1 ${containerWidth}`}>
       {!isCompact && (
        <div className="h-4 flex items-center justify-center">
            <span className={`text-sm font-semibold truncate w-full text-center ${styles.text}`}>{track.name}</span>
        </div>
       )}
      <div 
        className={`bg-audio-dark rounded-md p-1 flex items-end relative cursor-ns-resize focus:outline-none focus:ring-2 focus:ring-audio-accent ${faderHeight} w-full`}
        ref={faderRef} 
        onMouseDown={startDrag}
        onKeyDown={handleFaderKeyDown}
        role="slider"
        tabIndex={0}
        aria-label={`${track.name} volume`}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(track.volume * 100)}
      >
        {isError && (
            <div 
                className="absolute inset-0 bg-audio-red/80 flex items-center justify-center z-20 rounded-md text-white text-center p-1 pointer-events-none"
                title={error.message}
                aria-label={`Error loading ${track.name}`}
            >
                <span className="text-xs font-bold">Failed</span>
            </div>
        )}
        {isLoading && !isError && (
            <div className="absolute inset-0 bg-audio-dark/70 flex flex-col justify-end z-10 rounded-md overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="w-full bg-audio-accent/70" style={{ height: `${loadingProgress}%` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono text-white font-bold drop-shadow-md">
                        {Math.round(loadingProgress!)}%
                    </span>
                </div>
            </div>
        )}
        <div className={`w-full rounded-sm ${styles.fader}`} style={{ height: `${track.volume * 100}%` }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-audio-text-light rounded-full" style={{ transform: `translateY(${(1 - track.volume) * (isCompact ? -120 : -184)}px) translateX(-50%)` }}/>
      </div>
      <div className="flex gap-1 w-full">
        <button
          onClick={() => onUpdate(track.id, { isMuted: !track.isMuted })}
          aria-label={`Mute ${track.name}`}
          aria-pressed={track.isMuted}
          className={`flex-1 py-1 rounded-md text-xs font-bold ${track.isMuted ? `${styles.button} text-white` : 'bg-audio-light text-audio-text-disabled hover:bg-audio-border'}`}
        >
          M
        </button>
        <button
          onClick={() => onUpdate(track.id, { isSoloed: !track.isSoloed })}
          aria-label={`Solo ${track.name}`}
          aria-pressed={track.isSoloed}
          className={`flex-1 py-1 rounded-md text-xs font-bold ${track.isSoloed ? `${styles.solo} text-black` : 'bg-audio-light text-audio-text-disabled hover:bg-audio-border'}`}
        >
          S
        </button>
      </div>
       {!isCompact && (
        <div className="h-4 mt-1 flex items-center justify-center">
            <span className="text-xs text-audio-text-disabled truncate w-full text-center">{track.subName || track.name}</span>
        </div>
       )}
    </div>
  );
};

interface MixerProps {
  tracks: Track[];
  onTrackUpdate: (id: string, updates: Partial<Track>) => void;
  loadingProgress: { overall: number; tracks: Record<string, number> };
  trackLoadErrors: Record<string, Error>;
}

export const Mixer: React.FC<MixerProps> = ({ tracks, onTrackUpdate, loadingProgress, trackLoadErrors }) => {
  return (
    <div className="bg-audio-mid rounded-lg p-2 flex-grow overflow-x-auto overflow-y-hidden">
      <div className="flex gap-2 h-full">
        {tracks.map(track => (
          <ChannelStrip 
            key={track.id} 
            track={track} 
            onUpdate={onTrackUpdate} 
            loadingProgress={loadingProgress.tracks[track.id]}
            error={trackLoadErrors[track.id]}
          />
        ))}
      </div>
    </div>
  );
};

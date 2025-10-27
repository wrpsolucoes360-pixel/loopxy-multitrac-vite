

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { SongSection } from '../types';

interface WaveformDisplayProps {
  currentTime: number;
  duration: number;
  sections?: SongSection[];
  isLoading?: boolean;
  loop: { start: number; end: number; enabled: boolean };
  onUpdateLoop: (updates: Partial<{ start: number; end: number; enabled: boolean }>) => void;
  onSeek: (time: number) => void;
}

const sectionColorMap: { [key: string]: string } = {
  'intro': 'bg-sky-500', 'verse': 'bg-emerald-500', 'pre-chorus': 'bg-lime-400',
  'prechorus': 'bg-lime-400', 'chorus': 'bg-amber-400', 'bridge': 'bg-violet-500',
  'solo': 'bg-rose-500', 'instrumental': 'bg-cyan-500', 'tag': 'bg-pink-500',
  'outro': 'bg-slate-500', 'vamp': 'bg-orange-500', 'st': 'bg-slate-500', 'vo': 'bg-audio-pink',
  'c': 'bg-audio-yellow', 'b': 'bg-audio-cyan'
};

const getSectionColor = (label: string) => {
    const lowerLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '').split(/[\s-]/)[0];
    return sectionColorMap[lowerLabel] || 'bg-gray-400';
};

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ 
    currentTime, duration, sections, isLoading, loop, onUpdateLoop, onSeek 
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const waveformRef = useRef<HTMLDivElement>(null);
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!draggingHandle || !waveformRef.current || duration <= 0) return;
      
      const rect = waveformRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = position * duration;

      if (draggingHandle === 'start') {
          if (time < loop.end) onUpdateLoop({ start: time });
      } else { // 'end'
          if (time > loop.start) onUpdateLoop({ end: time });
      }
  }, [draggingHandle, duration, loop, onUpdateLoop]);

  const handleMouseUp = useCallback(() => {
    setDraggingHandle(null);
  }, []);

  useEffect(() => {
    if (draggingHandle) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingHandle, handleMouseMove, handleMouseUp]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (duration > 0 && waveformRef.current && !draggingHandle) {
          const rect = waveformRef.current.getBoundingClientRect();
          const position = (e.clientX - rect.left) / rect.width;
          onSeek(position * duration);
      }
  };

  const waveformBars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      let barColor = 'bg-slate-400';
      if (sections && sections.length > 0) {
          let progressThroughSections = 0;
          for (const section of sections) {
              progressThroughSections += section.length;
              if ((i / 150) < progressThroughSections) {
                  barColor = getSectionColor(section.label); break;
              }
          }
      }
      return { height: Math.random() * 70 + 20, color: barColor };
    });
  }, [sections]);
  
  const sectionLabels = useMemo(() => {
      if (!sections) return null;
      let accumulatedLength = 0;
      return sections.map((section, index) => {
          const position = accumulatedLength * 100;
          const width = section.length * 100;
          accumulatedLength += section.length;
          if (width < 2) return null; // Hide label if section is too small
          return (
              <div 
                key={index} 
                className="absolute h-full flex items-center justify-center pointer-events-none" 
                style={{ left: `${position}%`, width: `${width}%` }}
              >
                  <span className="text-black text-xs font-bold px-1.5 py-0.5 rounded-sm bg-white/80 backdrop-blur-sm shadow-sm truncate">
                    {section.label}
                  </span>
              </div>
          )
      })
  }, [sections])

  const loopStartPercent = duration > 0 ? (loop.start / duration) * 100 : 0;
  const loopWidthPercent = duration > 0 ? ((loop.end - loop.start) / duration) * 100 : 0;

  return (
    <div className="bg-audio-mid rounded-lg p-2 relative h-36 flex flex-col justify-center items-center">
        {isLoading && (
            <div className="absolute inset-0 bg-audio-mid/70 flex flex-col items-center justify-center z-30 rounded-lg">
                <p className="text-audio-text-light font-semibold">Analyzing song structure with Gemini...</p>
                <div className="w-48 h-1 bg-audio-light rounded-full mt-2 overflow-hidden">
                    <div className="h-1 bg-audio-accent animate-pulse" style={{width: '100%', animation: 'indeterminate-progress 2s infinite linear'}}></div>
                </div>
                <style>{`@keyframes indeterminate-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
            </div>
        )}
        <div className="w-full h-6 mb-1 relative">{sectionLabels}</div>
        <div ref={waveformRef} onClick={handleWaveformClick} className="w-full h-full relative overflow-hidden flex items-center cursor-pointer bg-audio-dark rounded-md">
            
            <div className="w-full flex items-center justify-between h-full px-1">
            {waveformBars.map((bar, i) => (
                <div key={i} className={`w-px ${bar.color}`} style={{ height: `${bar.height}%` }}/>
            ))}
            </div>

            {loop.enabled && duration > 0 && (
                <>
                  <div 
                    className="absolute top-0 h-full bg-audio-cyan/50 backdrop-blur-sm z-20 pointer-events-none"
                    style={{ left: `${loopStartPercent}%`, width: `${loopWidthPercent}%` }}
                  />
                  <div
                    onMouseDown={(e) => { e.stopPropagation(); setDraggingHandle('start'); }}
                    className="absolute top-0 -translate-x-1/2 h-full w-2 cursor-ew-resize z-20 flex justify-center"
                    style={{ left: `${loopStartPercent}%` }}
                  >
                    <div className="w-0.5 h-full bg-audio-cyan"></div>
                  </div>
                  <div 
                    onMouseDown={(e) => { e.stopPropagation(); setDraggingHandle('end'); }}
                    className="absolute top-0 -translate-x-1/2 h-full w-2 cursor-ew-resize z-20 flex justify-center"
                    style={{ left: `${loopStartPercent + loopWidthPercent}%` }}
                  >
                    <div className="w-0.5 h-full bg-audio-cyan"></div>
                  </div>
                </>
            )}

            <div
                className="absolute top-0 h-full w-0.5 bg-red-500 z-20 pointer-events-none"
                style={{ left: `${progress}%` }}
            />
      </div>
    </div>
  );
};

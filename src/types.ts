export type TrackColor = 
  | 'slate' 
  | 'red' 
  | 'orange' 
  | 'amber' 
  | 'lime' 
  | 'green' 
  | 'emerald'
  | 'cyan'
  | 'sky'
  | 'indigo'
  | 'violet'
  | 'fuchsia'
  | 'rose';

export interface Track {
  id: string;
  name: string;
  url: string;
  subName?: string;
  volume: number; // 0 to 1
  gain: number; // 0 to 1
  isMuted: boolean;
  isSoloed: boolean;
  color: TrackColor;
}

export interface SongSection {
  label: string;
  length: number; // as a fraction of total, e.g. 0.25 for 25%
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  version?: string;
  key: string;
  bpm: number;
  artworkUrl: string;
  tracks: Track[];
  structure?: SongSection[];
}

export interface Setlist {
  id: number;
  name: string;
  songIds: number[];
}

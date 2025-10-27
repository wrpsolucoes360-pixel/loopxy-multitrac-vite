

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const iconProps = (size: number = 24): React.SVGProps<SVGSVGElement> => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const Icons = {
  Play: ({ size }: IconProps) => <svg {...iconProps(size)}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  Pause: ({ size }: IconProps) => <svg {...iconProps(size)}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>,
  Stop: ({ size }: IconProps) => <svg {...iconProps(size)}><rect x="3" y="3" width="18" height="18"></rect></svg>,
  Rewind: ({ size }: IconProps) => <svg {...iconProps(size)}><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>,
  FastForward: ({ size }: IconProps) => <svg {...iconProps(size)}><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>,
  Settings: ({ size }: IconProps) => <svg {...iconProps(size)}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Midi: ({ size }: IconProps) => <svg {...iconProps(size)}><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="6" cy="12" r="1"></circle><circle cx="10" cy="12" r="1"></circle><circle cx="14" cy="12" r="1"></circle><circle cx="18" cy="12" r="1"></circle></svg>,
  Outs: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M18 10h-2.5c-.8 0-1.5.7-1.5 1.5v1c0 .8.7 1.5 1.5 1.5H18"/><path d="M6 10H4c-1.1 0-2 .9-2 2v0c0 1.1.9 2 2 2h2"/><path d="M12 10h-2c-1.1 0-2 .9-2 2v0c0 1.1.9 2 2 2h2"/></svg>,
  MoreHorizontal: ({ size }: IconProps) => <svg {...iconProps(size)}><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>,
  Library: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/><path d="M6 18h12"/><path d="M6 14h12"/><path d="M6 10h12"/><path d="M6 6h12"/></svg>,
  Edit: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  Power: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>,
  Undo: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M3 9h12a5 5 0 0 1 5 5v7"/><polyline points="7 5 3 9 7 13"/></svg>,
  Redo: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M21 9H9a5 5 0 0 0-5 5v7"/><polyline points="17 5 21 9 17 13"/></svg>,
  Grid: ({ size }: IconProps) => <svg {...iconProps(size)}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Close: ({ size }: IconProps) => <svg {...iconProps(size)}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Loader: ({ size }: IconProps) => <svg {...iconProps(size)} className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Plus: ({ size }: IconProps) => <svg {...iconProps(size)}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Sparkles: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 21l1.9-4.8 4.8-1.9-4.8-1.9L12 3zM5 5l1.5 3.5L10 10l-3.5 1.5L5 15l-1.5-3.5L0 10l3.5-1.5L5 5zM19 5l1.5 3.5L24 10l-3.5 1.5L19 15l-1.5-3.5L14 10l3.5-1.5L19 5z"/></svg>,
  Trash: ({ size }: IconProps) => <svg {...iconProps(size ?? 16)} width={size ?? 16} height={size ?? 16}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
  Repeat: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>,
  Menu: ({ size }: IconProps) => <svg {...iconProps(size)}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Cloud: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>,
  CloudOff: ({ size }: IconProps) => <svg {...iconProps(size)}><path d="m2.61 2.61 18.78 18.78M7.75 7.75a8.003 8.003 0 0 0-4.47 5.25A5 5 0 0 0 9 20h9a5 5 0 0 0 4.88-4.03M14 14.75a8.003 8.003 0 0 0 4.25-5.25A8 8 0 0 0 10 4.27"/></svg>,
  Google: ({ size = 24 }: IconProps) => <svg role="img" width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path fill="#4285F4" d="M21.54 10.12h-9.3v3.74h5.5c-.24 1.22-1.04 2.8-2.6 3.82v2.46h3.18c1.86-1.72 2.94-4.28 2.94-7.18 0-.66-.06-1.28-.18-1.84z"/><path fill="#34A853" d="M12.24 22c2.6 0 4.78-.86 6.36-2.34l-3.18-2.46c-.86.58-1.96.92-3.18.92-2.46 0-4.54-1.66-5.28-3.9H3.7v2.54C5.28 20.14 8.5 22 12.24 22z"/><path fill="#FBBC05" d="M6.96 14.12c-.2-.58-.32-1.2-.32-1.84s.12-1.26.32-1.84V7.9H3.7C2.9 9.42 2.5 11.16 2.5 13s.4 3.58 1.2 5.1l3.26-2.54z"/><path fill="#EA4335" d="M12.24 5.92c1.42 0 2.68.5 3.68 1.44l2.82-2.82C17.02 2.86 14.84 2 12.24 2 8.5 2 5.28 3.86 3.7 6.4L6.96 8.94c.74-2.24 2.82-3.9 5.28-3.9z"/></svg>,
};

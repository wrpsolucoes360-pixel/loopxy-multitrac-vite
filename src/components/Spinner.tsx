import React from 'react';
import { Icons } from './Icons';

/**
 * A simple spinner component for indicating loading states.
 * It uses the Loader SVG icon which includes an animation.
 */
export const Spinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className ?? ''}`} role="status" aria-live="polite">
      <Icons.Loader />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

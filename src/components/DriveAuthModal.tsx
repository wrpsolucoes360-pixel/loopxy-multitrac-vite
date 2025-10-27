

import React from 'react';
import { Icons } from './Icons';

interface DriveAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export const DriveAuthModal: React.FC<DriveAuthModalProps> = ({ isOpen, onClose, onAllow }) => {
  if (!isOpen) return null;

  const handleAllow = () => {
    onAllow();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-audio-dark/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <header className="p-6 border-b border-gray-200 flex flex-col items-center text-center">
            <Icons.Google size={32}/>
            <h2 className="text-xl font-bold mt-4">Connect to Google Drive</h2>
            <p className="text-sm text-gray-500 mt-1">This is a simulated authentication screen.</p>
        </header>

        <main className="p-6">
            <div className="text-center mb-6">
                <p className="font-semibold">Loopxy-MultiTrack is requesting permission to:</p>
            </div>
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <Icons.Cloud className="text-blue-500 mt-1 flex-shrink-0"/>
                    <div>
                        <h3 className="font-semibold">Create and manage its own files in your Google Drive</h3>
                        <p className="text-sm text-gray-600">The app will store your audio tracks in a dedicated folder. It will not have access to any other files in your Drive.</p>
                    </div>
                </div>
            </div>
             <div className="mt-6 p-3 bg-yellow-100/80 border border-yellow-300 rounded-md text-sm text-yellow-800">
                <strong>Developer Note:</strong> In a real application, this would be a secure Google pop-up window. This simulation allows us to test the cloud-saving functionality without a full backend setup.
            </div>
        </main>

        <footer className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-700 rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={handleAllow} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Allow Access</button>
        </footer>
      </div>
    </div>
  );
};

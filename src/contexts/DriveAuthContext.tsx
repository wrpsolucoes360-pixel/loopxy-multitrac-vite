
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DriveAuthModal } from '../components/DriveAuthModal';

interface UserProfile {
    name: string;
    email: string;
    picture: string;
}

interface DriveAuthContextType {
    isDriveConnected: boolean;
    userProfile: UserProfile | null;
    connectDrive: () => void;
    disconnectDrive: () => void;
}

const DriveAuthContext = createContext<DriveAuthContextType | undefined>(undefined);

// Mock user profile for simulation
const mockUserProfile: UserProfile = {
    name: 'Demo User',
    email: 'demo.user@example.com',
    picture: `https://i.pravatar.cc/40?u=demo-user`,
};

export const DriveAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDriveConnected, setIsDriveConnected] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // TODO: In a real app, this would initiate the Google OAuth 2.0 flow.
    const connectDrive = () => {
        setIsAuthModalOpen(true);
    };

    const handleAllowAccess = () => {
        // This simulates a successful authentication
        setIsDriveConnected(true);
        setUserProfile(mockUserProfile);
    }
    
    // TODO: In a real app, this would sign the user out.
    const disconnectDrive = () => {
        setIsDriveConnected(false);
        setUserProfile(null);
    };

    return (
        <DriveAuthContext.Provider value={{ isDriveConnected, userProfile, connectDrive, disconnectDrive }}>
            {children}
            <DriveAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAllow={handleAllowAccess}
            />
        </DriveAuthContext.Provider>
    );
};

export const useDriveAuth = () => {
    const context = useContext(DriveAuthContext);
    if (context === undefined) {
        throw new Error('useDriveAuth must be used within a DriveAuthProvider');
    }
    return context;
};

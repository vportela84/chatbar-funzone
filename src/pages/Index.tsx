
import React, { useState } from 'react';
import QRScanner from '@/components/QRScanner';
import ProfileSetup from '@/components/ProfileSetup';
import ChatRoom from '@/components/ChatRoom';

type Profile = {
  name: string;
  phone: string;
} | null;

type AppState = 'SCAN' | 'PROFILE' | 'CHAT';

const Index = () => {
  const [state, setState] = useState<AppState>('SCAN');
  const [tableId, setTableId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(null);

  const handleScan = (scannedTableId: string) => {
    setTableId(scannedTableId);
    setState('PROFILE');
  };

  const handleProfileComplete = (profileData: { name: string; phone: string }) => {
    setProfile(profileData);
    setState('CHAT');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Social</h1>
          <p className="text-bar-text/80">Connect with people at the bar</p>
        </header>

        {state === 'SCAN' && (
          <QRScanner onScan={handleScan} />
        )}

        {state === 'PROFILE' && tableId && (
          <ProfileSetup onComplete={handleProfileComplete} tableId={tableId} />
        )}

        {state === 'CHAT' && tableId && profile && (
          <ChatRoom tableId={tableId} profile={profile} />
        )}
      </div>
    </div>
  );
};

export default Index;


import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProfileSetup from '@/components/ProfileSetup';
import BarHeader from '@/components/table/BarHeader';
import ConnectedUsersList from '@/components/table/ConnectedUsersList';
import { useBarConnection } from '@/hooks/useBarConnection';

const TableChat = () => {
  const { barId, tableId } = useParams();
  const {
    barInfo,
    userProfile,
    connectedUsers,
    isLoading,
    createProfile,
    startChat,
    leaveBar
  } = useBarConnection(barId, tableId);

  if (!barInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-primary p-6">
        Carregando...
      </div>
    );
  }

  // If user hasn't set up a profile yet, show profile setup form
  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-primary p-6">
        <ProfileSetup onComplete={createProfile} barInfo={barInfo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bar-bg to-black text-primary p-6">
      <BarHeader barName={barInfo.barName} tableNumber={barInfo.tableNumber} />
      
      <main className="flex-1 container mx-auto">
        <ConnectedUsersList 
          users={connectedUsers}
          isLoading={isLoading}
          onStartChat={startChat}
        />
        
        <div className="text-center">
          <Button
            onClick={leaveBar}
            variant="outline"
          >
            Sair do Bar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TableChat;

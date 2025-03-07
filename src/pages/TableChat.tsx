
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProfileSetup from '@/components/ProfileSetup';
import BarHeader from '@/components/table/BarHeader';
import ConnectedUsersList from '@/components/table/ConnectedUsersList';
import { useBarConnection } from '@/hooks/useBarConnection';
import TableChatLayout from '@/components/layouts/TableChatLayout';

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
      <TableChatLayout>
        <div className="flex items-center justify-center h-full">
          Carregando...
        </div>
      </TableChatLayout>
    );
  }

  // If user hasn't set up a profile yet, show profile setup form
  if (!userProfile) {
    return (
      <TableChatLayout>
        <div className="flex items-center justify-center">
          <ProfileSetup onComplete={createProfile} barInfo={barInfo} />
        </div>
      </TableChatLayout>
    );
  }

  return (
    <TableChatLayout barName={barInfo.barName} tableNumber={barInfo.tableNumber}>
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
    </TableChatLayout>
  );
};

export default TableChat;

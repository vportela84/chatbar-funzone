
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import { useChat, type ChatTarget } from '@/hooks/useChat';
import TableChatLayout from '@/components/layouts/TableChatLayout';

const UserChat = () => {
  const { barId } = useParams();
  const navigate = useNavigate();
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Recupera informações do alvo do chat do sessionStorage
    const storedChatTarget = sessionStorage.getItem('chatTarget');
    if (storedChatTarget) {
      setChatTarget(JSON.parse(storedChatTarget));
    }

    // Recupera o ID do usuário atual do sessionStorage
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    }
  }, []);

  const { 
    messages, 
    newMessage, 
    setNewMessage, 
    isLoading, 
    sendMessage 
  } = useChat(chatTarget, currentUserId);

  const handleBackToUsers = () => {
    navigate(`/bar/${barId}/table/${currentUserId}`);
  };

  if (!chatTarget) {
    return (
      <TableChatLayout>
        <div className="flex items-center justify-center h-full">
          Carregando...
        </div>
      </TableChatLayout>
    );
  }

  return (
    <TableChatLayout barName={chatTarget.barName}>
      <div className="mx-auto flex flex-col w-full max-w-md">
        <ChatHeader chatTarget={chatTarget} onBack={handleBackToUsers} />
        
        <Card className="bg-bar-bg border-primary/20 mb-4 flex-1 flex flex-col">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-primary text-lg">Mensagens</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto flex flex-col p-3">
            <div className="flex-1 overflow-y-auto">
              <ChatMessageList 
                messages={messages} 
                currentUserId={currentUserId} 
              />
            </div>
          </CardContent>
        </Card>
        
        <ChatInput 
          value={newMessage}
          onChange={setNewMessage}
          onSend={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </TableChatLayout>
  );
};

export default UserChat;

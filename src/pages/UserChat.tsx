
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import { useChat, type ChatTarget } from '@/hooks/useChat';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-primary p-4">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bar-bg to-black text-primary p-4 sm:p-6">
      <ChatHeader chatTarget={chatTarget} onBack={handleBackToUsers} />
      
      <main className="flex-1 mx-auto flex flex-col w-full max-w-md">
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
      </main>
    </div>
  );
};

export default UserChat;

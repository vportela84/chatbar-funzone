
// Import necessary dependencies and components
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import { useChat } from '@/hooks/useChat';

// The ChatRoom component that will display messages between users
const ChatRoom = () => {
  // Get the chat ID and bar ID from the URL params
  const { chatId, barId } = useParams();
  const navigate = useNavigate();
  
  // State to store data about the chat target
  const [chatTarget, setChatTarget] = useState(null);
  // State to store the current user's ID
  const [currentUserId, setCurrentUserId] = useState('');
  
  // Initialize with stored data from sessionStorage
  useEffect(() => {
    // Load chat target info from sessionStorage
    const storedChatTarget = sessionStorage.getItem('chatTarget');
    const storedUserId = sessionStorage.getItem('userId');
    
    if (storedChatTarget && storedUserId) {
      setChatTarget(JSON.parse(storedChatTarget));
      setCurrentUserId(storedUserId);
    } else {
      // If we don't have the data, go back to the table chat
      navigate(`/bar/${barId}`);
    }
  }, [barId, chatId, navigate]);
  
  // Use the chat hook to manage messages and chat functionality
  const { messages, newMessage, setNewMessage, isLoading, sendMessage } = useChat(chatTarget, currentUserId);
  
  // Handler for the back button
  const handleBack = () => {
    navigate(`/bar/${barId}`);
  };
  
  // If we don't have the chat data yet, show a loading indicator
  if (!chatTarget || !currentUserId) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-bar-bg to-black p-4">
        <p className="text-xl text-primary">Loading...</p>
      </div>
    );
  }
  
  const renderChatMessage = (message) => {
    const isOwn = message.sender_profile_id === currentUserId;
    const messageStyles = isOwn
      ? "bg-primary/10 ml-auto border-primary/20 text-primary"
      : "bg-black/20 border-primary/20 mr-auto text-primary";
    
    const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div 
        key={message.id} 
        className={`${messageStyles} p-3 rounded-lg border max-w-[80%] mb-2`}
      >
        <p className="break-words">{message.message}</p>
        <span className="text-xs opacity-70 block text-right mt-1">{time}</span>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bar-bg to-black p-4">
      <ChatHeader 
        chatTarget={chatTarget}
        onBack={handleBack}
      />
      
      <div className="flex-1 overflow-y-auto mb-4 flex flex-col-reverse px-2">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-center py-4 text-primary opacity-70">Nenhuma mensagem ainda. Inicie uma conversa!</p>
          ) : (
            messages.map(renderChatMessage)
          )}
        </div>
      </div>
      
      <ChatInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatRoom;

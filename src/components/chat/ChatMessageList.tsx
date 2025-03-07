
import React, { useRef, useEffect } from 'react';
import { type Message } from '@/hooks/useChat';

interface ChatMessageListProps {
  messages: Message[];
  currentUserId: string;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll para a última mensagem quando novas mensagens chegarem
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return <p className="text-center py-4 text-primary">Nenhuma mensagem ainda. Diga olá!</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`flex ${message.sender_profile_id === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] rounded-lg px-3 py-2 ${
              message.sender_profile_id === currentUserId 
                ? 'bg-primary text-black rounded-tr-none' 
                : 'bg-black/30 text-primary rounded-tl-none'
            }`}
          >
            <p>{message.message}</p>
            <p className="text-xs opacity-70 text-right mt-1">
              {formatTime(message.created_at)}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;

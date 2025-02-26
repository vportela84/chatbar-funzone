
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onLike: (messageId: string) => void;
}

const ChatMessage = ({ message, isCurrentUser, onLike }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <div className="text-sm opacity-80">
          {message.sender} (Mesa {message.table})
        </div>
        <div className="mt-1">{message.text}</div>
        <div className="mt-2 flex items-center justify-end gap-2 text-sm">
          <span>{message.likes} curtidas</span>
          {!isCurrentUser && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-white/10"
              onClick={() => onLike(message.id)}
              disabled={message.likes >= 1}
            >
              <Heart className={`w-4 h-4 ${message.likes >= 1 ? 'opacity-50' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

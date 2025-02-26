
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatMessageFormProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ChatMessageForm = ({ message, onMessageChange, onSubmit }: ChatMessageFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex space-x-2">
      <Input
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Digite sua mensagem..."
        className="flex-1 bg-black/20 border-primary/20 text-bar-text"
      />
      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default ChatMessageForm;


import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type ChatTarget } from '@/hooks/useChat';

interface ChatHeaderProps {
  chatTarget?: ChatTarget;
  targetName?: string;
  targetTableId?: string;
  barName?: string;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  chatTarget, 
  targetName, 
  targetTableId, 
  barName, 
  onBack 
}) => {
  // Use either the direct props or the chatTarget object
  const displayName = targetName || (chatTarget?.userName || '');
  const displayBarName = barName || (chatTarget?.barName || '');
  
  return (
    <header className="py-2 sm:py-4 border-b border-primary/20 mb-4 sm:mb-6">
      <div className="mx-auto">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-2 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-primary">Voltar</span>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">{displayBarName}</h1>
        <p className="text-sm text-primary">Conversa com {displayName}</p>
      </div>
    </header>
  );
};

export default ChatHeader;

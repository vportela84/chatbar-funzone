
import React from 'react';

interface ChatHeaderProps {
  targetName: string;
  targetTableId: string;
  barName: string;
}

const ChatHeader = ({ targetName, targetTableId, barName }: ChatHeaderProps) => {
  return (
    <div className="bg-black/20 p-3 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-primary">
        Chat com {targetName}
      </h3>
      <p className="text-sm text-bar-text/80">
        Mesa {targetTableId} - {barName}
      </p>
    </div>
  );
};

export default ChatHeader;

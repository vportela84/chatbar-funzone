
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Heart } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: string;
  table: string;
  timestamp: Date;
}

interface ChatRoomProps {
  tableId: string;
  profile: {
    name: string;
    phone: string;
  };
}

const ChatRoom = ({ tableId, profile }: ChatRoomProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to the bar chat!",
      sender: "Bar Staff",
      table: "STAFF",
      timestamp: new Date(),
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: profile.name,
      table: tableId,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-bar-bg rounded-lg p-4 animate-fadeIn">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === profile.name ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === profile.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="text-sm opacity-80">
                {msg.sender} (Table {msg.table})
              </div>
              <div className="mt-1">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-black/20 border-primary/20 text-bar-text"
        />
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatRoom;

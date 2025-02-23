
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Heart } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  table: string;
  timestamp: Date;
  likes: number;
}

interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId?: string;
}

interface ChatRoomProps {
  tableId: string;
  profile: Profile;
  targetProfile: Profile;
}

const ChatRoom = ({ tableId, profile, targetProfile }: ChatRoomProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [barName, setBarName] = useState("");
  const { toast } = useToast();

  // Carregar nome do bar
  useEffect(() => {
    const loadBarName = async () => {
      if (!profile.barId) return;
      
      const { data, error } = await supabase
        .from('bars')
        .select('name')
        .eq('id', profile.barId)
        .single();

      if (error) {
        console.error('Erro ao carregar nome do bar:', error);
        return;
      }

      if (data) {
        setBarName(data.name);
      }
    };

    loadBarName();
  }, [profile.barId]);

  // Carregar mensagens existentes
  useEffect(() => {
    const loadMessages = async () => {
      if (!profile.barId) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, bar_profiles!sender_profile_id(name, table_id)')
        .or(`and(sender_profile_id.eq.${profile.phone},receiver_profile_id.eq.${targetProfile.phone}),and(sender_profile_id.eq.${targetProfile.phone},receiver_profile_id.eq.${profile.phone})`)
        .eq('bar_id', profile.barId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      if (data) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.bar_profiles.name,
          sender_profile_id: msg.sender_profile_id,
          receiver_profile_id: msg.receiver_profile_id,
          table: msg.bar_profiles.table_id,
          timestamp: new Date(msg.created_at),
          likes: msg.likes || 0
        }));
        setMessages(formattedMessages);
      }
    };

    loadMessages();

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `bar_id=eq.${profile.barId}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.barId, profile.phone, targetProfile.phone]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !profile.barId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_profile_id: profile.phone,
          receiver_profile_id: targetProfile.phone,
          bar_id: profile.barId,
          message: message.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: Message = {
        id: data.id,
        text: message.trim(),
        sender: profile.name,
        sender_profile_id: profile.phone,
        receiver_profile_id: targetProfile.phone,
        table: tableId,
        timestamp: new Date(),
        likes: 0
      };

      setMessages([...messages, newMessage]);
      setMessage("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (messageId: string) => {
    try {
      const { error } = await supabase.rpc('increment_message_likes', {
        message_id: messageId
      });

      if (error) throw error;

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, likes: msg.likes + 1 }
            : msg
        )
      );
    } catch (error) {
      console.error('Erro ao curtir mensagem:', error);
      toast({
        title: "Erro ao curtir mensagem",
        description: "Não foi possível curtir a mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-bar-bg rounded-lg p-4 animate-fadeIn">
      <div className="bg-black/20 p-3 rounded-lg mb-4">
        <h3 className="text-lg font-semibold text-primary">
          Chat com {targetProfile.name}
        </h3>
        <p className="text-sm text-bar-text/80">
          Mesa {targetProfile.tableId} - {barName}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_profile_id === profile.phone ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender_profile_id === profile.phone
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="text-sm opacity-80">
                {msg.sender} (Mesa {msg.table})
              </div>
              <div className="mt-1">{msg.text}</div>
              <div className="mt-2 flex items-center justify-end gap-2 text-sm">
                <span>{msg.likes} curtidas</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-white/10"
                  onClick={() => handleLike(msg.id)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
    </div>
  );
};

export default ChatRoom;

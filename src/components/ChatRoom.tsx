
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

  // Solicitar permissão para notificações
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
    };
    requestNotificationPermission();
  }, []);

  // Função para mostrar notificação
  const showNotification = (senderName: string, messageText: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Nova mensagem de ${senderName}`, {
        body: messageText,
        icon: '/favicon.ico'
      });
    }
  };

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

  useEffect(() => {
    const loadMessages = async () => {
      if (!profile.barId) return;

      const query = `phone.eq.${profile.phone},phone.eq.${targetProfile.phone}`;
      
      const { data: profiles, error: profilesError } = await supabase
        .from('bar_profiles')
        .select('name, phone, table_id')
        .or(query);

      if (profilesError) {
        console.error('Erro ao carregar perfis:', profilesError);
        return;
      }

      const profileMap = new Map(profiles.map(p => [p.phone, p]));

      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_profile_id.eq.${profile.phone},receiver_profile_id.eq.${targetProfile.phone}),and(sender_profile_id.eq.${targetProfile.phone},receiver_profile_id.eq.${profile.phone})`)
        .eq('bar_id', profile.barId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Erro ao carregar mensagens:', messagesError);
        return;
      }

      if (messages) {
        const formattedMessages = formatMessages(messages, profileMap);
        setMessages(formattedMessages);
      }
    };

    loadMessages();

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `bar_id=eq.${profile.barId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newMessage } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (newMessage) {
              const { data: senderProfile } = await supabase
                .from('bar_profiles')
                .select('name, phone, table_id')
                .eq('phone', newMessage.sender_profile_id)
                .single();

              if (senderProfile) {
                const formattedMessage = {
                  id: newMessage.id,
                  text: newMessage.message,
                  sender: senderProfile.name,
                  sender_profile_id: newMessage.sender_profile_id,
                  receiver_profile_id: newMessage.receiver_profile_id,
                  table: senderProfile.table_id,
                  timestamp: new Date(newMessage.created_at),
                  likes: newMessage.likes || 0
                };

                setMessages(prev => [...prev, formattedMessage]);

                // Mostrar notificação apenas para mensagens recebidas
                if (newMessage.sender_profile_id !== profile.phone) {
                  showNotification(senderProfile.name, newMessage.message);
                }
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            // Atualizar likes
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id 
                  ? { ...msg, likes: payload.new.likes }
                  : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.barId, profile.phone, targetProfile.phone]);

  const formatMessages = (messages: any[], profileMap: Map<string, any>): Message[] => {
    return messages.map(msg => ({
      id: msg.id,
      text: msg.message,
      sender: profileMap.get(msg.sender_profile_id)?.name || 'Usuário',
      sender_profile_id: msg.sender_profile_id,
      receiver_profile_id: msg.receiver_profile_id,
      table: profileMap.get(msg.sender_profile_id)?.table_id || 'N/A',
      timestamp: new Date(msg.created_at),
      likes: msg.likes || 0
    }));
  };

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
      const message = messages.find(m => m.id === messageId);
      
      if (message?.likes >= 1) {
        toast({
          title: "Limite de curtidas",
          description: "Esta mensagem já foi curtida.",
          variant: "default"
        });
        return;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .update({ likes: 1 })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
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
                {msg.sender_profile_id !== profile.phone && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-white/10"
                    onClick={() => handleLike(msg.id)}
                    disabled={msg.likes >= 1}
                  >
                    <Heart className={`w-4 h-4 ${msg.likes >= 1 ? 'opacity-50' : ''}`} />
                  </Button>
                )}
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

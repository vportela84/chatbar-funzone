
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  message: string;
  created_at: string;
}

export interface ChatTarget {
  userId: string;
  userName: string;
  barId: string;
  barName: string;
}

export const useChat = (chatTarget: ChatTarget | null, currentUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatTarget || !currentUserId) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('bar_id', chatTarget.barId)
          .or(`sender_profile_id.eq.${currentUserId},receiver_profile_id.eq.${currentUserId}`)
          .or(`sender_profile_id.eq.${chatTarget.userId},receiver_profile_id.eq.${chatTarget.userId}`)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Erro ao buscar mensagens:', error);
          return;
        }
        
        setMessages(data || []);
      } catch (error) {
        console.error('Erro:', error);
      }
    };
    
    if (chatTarget && currentUserId) {
      fetchMessages();
      
      // Inscreve-se para atualizações em tempo real
      const channel = supabase
        .channel('chat_messages_changes')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `bar_id=eq.${chatTarget.barId}`
        }, (payload) => {
          const newMessage = payload.new as Message;
          
          // Verifica se a mensagem é relevante para esta conversa
          if ((newMessage.sender_profile_id === currentUserId && newMessage.receiver_profile_id === chatTarget.userId) ||
              (newMessage.sender_profile_id === chatTarget.userId && newMessage.receiver_profile_id === currentUserId)) {
            setMessages(prev => [...prev, newMessage]);
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatTarget, currentUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatTarget || !currentUserId) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          bar_id: chatTarget.barId,
          sender_profile_id: currentUserId,
          receiver_profile_id: chatTarget.userId,
          message: newMessage.trim()
        });
      
      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem",
          variant: "destructive"
        });
        return;
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    sendMessage
  };
};


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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset state when chat target changes
  useEffect(() => {
    if (chatTarget) {
      setMessages([]);
      setIsInitialLoading(true);
      setError(null);
    }
  }, [chatTarget?.userId, chatTarget?.barId]);

  // Fetch messages and setup real-time subscription
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatTarget || !currentUserId) return;
      
      setIsInitialLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('bar_id', chatTarget.barId)
          .or(`sender_profile_id.eq.${currentUserId},receiver_profile_id.eq.${currentUserId}`)
          .or(`sender_profile_id.eq.${chatTarget.userId},receiver_profile_id.eq.${chatTarget.userId}`)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching messages:', error);
          setError('Failed to load messages');
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive"
          });
          return;
        }
        
        setMessages(data || []);
      } catch (error) {
        console.error('Error:', error);
        setError('Something went wrong while loading messages');
        toast({
          title: "Error",
          description: "Something went wrong while loading messages",
          variant: "destructive"
        });
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    if (chatTarget && currentUserId) {
      fetchMessages();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('chat_messages_changes')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `bar_id=eq.${chatTarget.barId}`
        }, (payload) => {
          const newMessage = payload.new as Message;
          
          // Check if the message is relevant for this conversation
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
  }, [chatTarget, currentUserId, toast]);

  const sendMessage = async () => {
    const messageText = newMessage.trim();
    if (!messageText || !chatTarget || !currentUserId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const messageData = {
        bar_id: chatTarget.barId,
        sender_profile_id: currentUserId,
        receiver_profile_id: chatTarget.userId,
        message: messageText
      };
      
      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);
      
      if (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message');
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
        
        // Allow user to retry - don't clear the message input
        return;
      }
      
      // Only clear message if it was sent successfully
      setNewMessage('');
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong while sending your message');
      toast({
        title: "Error",
        description: "Something went wrong while sending your message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastFailedMessage = () => {
    if (error && newMessage.trim()) {
      sendMessage();
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isInitialLoading,
    error,
    sendMessage,
    retryLastFailedMessage
  };
};


import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  message: string;
  created_at: string;
}

interface ChatTarget {
  userId: string;
  userName: string;
  barId: string;
  barName: string;
}

const UserChat = () => {
  const { barId, userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Recupera informações do alvo do chat do sessionStorage
    const storedChatTarget = sessionStorage.getItem('chatTarget');
    if (storedChatTarget) {
      setChatTarget(JSON.parse(storedChatTarget));
    }

    // Recupera o ID do usuário atual do sessionStorage
    const storedBarInfo = sessionStorage.getItem('currentBar');
    if (storedBarInfo) {
      const barInfo = JSON.parse(storedBarInfo);
      // Aqui usamos o tableNumber como ID temporário do usuário
      // Em um sistema real, você usaria o ID real do usuário autenticado
      setCurrentUserId(barInfo.tableNumber);
    }
  }, []);

  useEffect(() => {
    // Scroll para a última mensagem quando novas mensagens chegarem
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const handleSendMessage = async () => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToUsers = () => {
    navigate(`/bar/${barId}/table/${currentUserId}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!chatTarget) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-primary p-6">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bar-bg to-black text-primary p-6">
      <header className="py-4 border-b border-primary/20 mb-6">
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={handleBackToUsers}
            className="mb-2 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-2xl font-bold">{chatTarget.barName}</h1>
          <p className="text-sm opacity-70">Conversa com {chatTarget.userName}</p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto flex flex-col">
        <Card className="bg-bar-bg border-primary/20 mb-4 flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-primary">Mensagens</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              {messages.length === 0 ? (
                <p className="text-center py-4 opacity-70">Nenhuma mensagem ainda. Diga olá!</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender_profile_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
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
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="bg-black/20 border-primary/20 text-primary resize-none"
            rows={2}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !newMessage.trim()}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default UserChat;

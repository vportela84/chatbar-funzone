
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Heart, User, Users2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Type for the connected users
interface ConnectedUser {
  id: string;
  name: string;
  table_id: string;
  photo?: string;
  interest: string;
}

interface ConnectedUsersListProps {
  users: ConnectedUser[];
  isLoading: boolean;
  onStartChat: (userId: string, userName: string) => void;
  currentUserId?: string;
}

const ConnectedUsersList: React.FC<ConnectedUsersListProps> = ({ 
  users, 
  isLoading, 
  onStartChat,
  currentUserId
}) => {
  const [unreadMessages, setUnreadMessages] = useState<{[key: string]: boolean}>({});

  // Função para traduzir o interesse para português
  const translateInterest = (interest: string) => {
    switch (interest) {
      case 'men':
        return 'Homens';
      case 'women':
        return 'Mulheres';
      case 'all':
      default:
        return 'Todos';
    }
  };

  // Função para obter o ícone de acordo com o interesse
  const getInterestIcon = (interest: string) => {
    switch (interest) {
      case 'men':
        return <User className="w-4 h-4 mr-1" />;
      case 'women':
        return <User className="w-4 h-4 mr-1" />;
      case 'all':
      default:
        return <Users2 className="w-4 h-4 mr-1" />;
    }
  };

  // Efeito para escutar novas mensagens em tempo real
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('chat_messages_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      }, (payload) => {
        // Verificar se a mensagem é destinada ao usuário atual
        const message = payload.new as any;
        if (message.receiver_profile_id === currentUserId) {
          // Marcar como não lida
          setUnreadMessages(prev => ({
            ...prev,
            [message.sender_profile_id]: true
          }));
        }
      })
      .subscribe();

    // Cleanup da subscription ao desmontar o componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <Card className="bg-bar-bg border-primary/20 mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary flex items-center">
          <Users className="mr-2" /> Pessoas no Bar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-4">Nenhuma pessoa conectada no momento.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">{user.name}</h3>
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-primary opacity-70">Mesa {user.table_id}</p>
                      <p className="text-xs text-primary opacity-70 flex items-center">
                        {getInterestIcon(user.interest)}
                        Interesse: {translateInterest(user.interest)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Button 
                    onClick={() => {
                      onStartChat(user.id, user.name);
                      // Limpar a notificação quando começar o chat
                      setUnreadMessages(prev => ({
                        ...prev,
                        [user.id]: false
                      }));
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Conversar
                  </Button>
                  
                  {unreadMessages[user.id] && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border border-white"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedUsersList;

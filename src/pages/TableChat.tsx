
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Users } from 'lucide-react';
import ProfileSetup from '@/components/ProfileSetup';

// Tipo para os usuários conectados no bar
interface ConnectedUser {
  id: string;
  name: string;
  table_id: string;
  photo?: string;
}

// Tipo para o perfil do usuário
interface UserProfile {
  name: string;
  phone: string;
  photo?: string;
  interest: string;
}

const TableChat = () => {
  const { barId, tableId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barInfo, setBarInfo] = useState<{barId: string, barName: string, tableNumber: string} | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Recupera as informações do bar do sessionStorage
    const storedBarInfo = sessionStorage.getItem('currentBar');
    if (storedBarInfo) {
      setBarInfo(JSON.parse(storedBarInfo));
    } else {
      // Se não houver informações armazenadas, usa os parâmetros da URL
      setBarInfo({
        barId: barId || '',
        barName: 'Bar',
        tableNumber: tableId || ''
      });
    }
    
    // Verifica se já existe um perfil salvo
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
      const storedUserId = sessionStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, [barId, tableId]);

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (!barInfo?.barId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('bar_profiles')
          .select('*')
          .eq('bar_id', barInfo.barId);
        
        if (error) {
          console.error('Erro ao buscar usuários:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os usuários conectados",
            variant: "destructive"
          });
        } else {
          setConnectedUsers(data || []);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (barInfo && userProfile) {
      fetchConnectedUsers();
    }
  }, [barInfo, toast, userProfile]);

  const handleProfileComplete = async (profile: UserProfile) => {
    try {
      // Gera um ID único para o usuário
      const newUserId = crypto.randomUUID();
      setUserId(newUserId);
      
      // Salva o perfil no sessionStorage
      sessionStorage.setItem('userProfile', JSON.stringify(profile));
      sessionStorage.setItem('userId', newUserId);
      
      // Salva o perfil no banco de dados
      const { error } = await supabase.from('bar_profiles').insert({
        id: newUserId,
        name: profile.name,
        phone: profile.phone || null,
        photo: profile.photo || null,
        interest: profile.interest,
        bar_id: barInfo?.barId,
        table_id: barInfo?.tableNumber
      });
      
      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu perfil",
          variant: "destructive"
        });
        return;
      }
      
      setUserProfile(profile);
      
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi criado com sucesso",
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleStartChat = (userId: string, userName: string) => {
    // Armazena informações do chat para uso na página de chat
    sessionStorage.setItem('chatTarget', JSON.stringify({
      userId,
      userName,
      barId: barInfo?.barId,
      barName: barInfo?.barName
    }));
    
    // Navega para a página de chat individual
    navigate(`/bar/${barInfo?.barId}/chat/${userId}`);
  };

  const handleLeaveBar = () => {
    // Remove o perfil do banco de dados
    if (userId) {
      supabase.from('bar_profiles').delete().eq('id', userId).then(({ error }) => {
        if (error) {
          console.error('Erro ao remover perfil:', error);
        }
      });
    }
    
    // Limpa as informações do sessionStorage
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('currentBar');
    sessionStorage.removeItem('chatTarget');
    
    toast({
      title: "Bar desconectado",
      description: "Você saiu do bar",
    });
    navigate('/');
  };

  if (!barInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-primary p-6">
        Carregando...
      </div>
    );
  }

  // Se o usuário ainda não preencheu o perfil, exibe o formulário
  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-primary p-6">
        <ProfileSetup onComplete={handleProfileComplete} barInfo={barInfo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bar-bg to-black text-primary p-6">
      <header className="py-4 border-b border-primary/20 mb-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{barInfo.barName}</h1>
          <p className="text-sm opacity-70">Mesa {barInfo.tableNumber}</p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto">
        <Card className="bg-bar-bg border-primary/20 mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-primary flex items-center">
              <Users className="mr-2" /> Pessoas no Bar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Carregando usuários...</p>
            ) : connectedUsers.length === 0 ? (
              <p className="text-center py-4">Nenhuma pessoa conectada no momento.</p>
            ) : (
              <div className="space-y-4">
                {connectedUsers.map((user) => (
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
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-xs opacity-70">Mesa {user.table_id}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleStartChat(user.id, user.name)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Conversar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button
            onClick={handleLeaveBar}
            variant="outline"
          >
            Sair do Bar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TableChat;

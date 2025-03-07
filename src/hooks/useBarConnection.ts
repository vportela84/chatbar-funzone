import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for bar info and user profile
interface BarInfo {
  barId: string;
  barName: string;
  tableNumber: string;
}

interface UserProfile {
  name: string;
  phone: string;
  photo?: string;
  interest: string;
}

interface ConnectedUser {
  id: string;
  name: string;
  table_id: string;
  photo?: string;
  interest: string;
}

export const useBarConnection = (barId?: string, tableId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barInfo, setBarInfo] = useState<BarInfo | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize bar info and user profile from session storage
  useEffect(() => {
    // Retrieve bar info from sessionStorage
    const storedBarInfo = sessionStorage.getItem('currentBar');
    if (storedBarInfo) {
      setBarInfo(JSON.parse(storedBarInfo));
    } else {
      // If no stored info, use URL parameters
      setBarInfo({
        barId: barId || '',
        barName: 'Bar',
        tableNumber: tableId || ''
      });
    }
    
    // Check for existing user profile
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
      const storedUserId = sessionStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, [barId, tableId]);

  // Fetch connected users when bar info and user profile are available
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
      
      // Configurar canal de tempo real para atualizações de usuários conectados
      const channel = supabase
        .channel('bar_profiles_changes')
        .on('postgres_changes', {
          event: '*', // Receber eventos de INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'bar_profiles',
          filter: `bar_id=eq.${barInfo.barId}`
        }, (payload) => {
          console.log('Mudança em perfis:', payload);
          
          // Quando um novo usuário entrar (INSERT)
          if (payload.eventType === 'INSERT') {
            const newUser = payload.new as ConnectedUser;
            setConnectedUsers(current => {
              // Verificar se o usuário já está na lista para evitar duplicações
              const userExists = current.some(user => user.id === newUser.id);
              if (userExists) return current;
              return [...current, newUser];
            });
            
            // Mostrar notificação de novo usuário
            if (newUser.id !== userId) {
              toast({
                title: "Novo usuário",
                description: `${newUser.name} entrou no bar`
              });
            }
          }
          
          // Quando um usuário sair (DELETE)
          else if (payload.eventType === 'DELETE') {
            const deletedUser = payload.old as ConnectedUser;
            setConnectedUsers(current => 
              current.filter(user => user.id !== deletedUser.id)
            );
          }
          
          // Quando um usuário atualizar seu perfil (UPDATE)
          else if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new as ConnectedUser;
            setConnectedUsers(current => 
              current.map(user => user.id === updatedUser.id ? updatedUser : user)
            );
          }
        })
        .subscribe();
      
      // Limpar o canal quando o componente for desmontado
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [barInfo, toast, userProfile, userId]);

  // Create a profile in the bar
  const createProfile = async (profile: UserProfile) => {
    try {
      // Generate unique user ID
      const newUserId = crypto.randomUUID();
      setUserId(newUserId);
      
      // Save profile to sessionStorage
      sessionStorage.setItem('userProfile', JSON.stringify(profile));
      sessionStorage.setItem('userId', newUserId);
      
      // Save profile to the database
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
        return false;
      }
      
      setUserProfile(profile);
      
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi criado com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return false;
    }
  };

  // Start chat with a user
  const startChat = (chatUserId: string, userName: string) => {
    if (!barInfo) return;
    
    // Store chat info in sessionStorage
    sessionStorage.setItem('chatTarget', JSON.stringify({
      userId: chatUserId,
      userName,
      barId: barInfo.barId,
      barName: barInfo.barName
    }));
    
    // Navigate to chat page
    navigate(`/bar/${barInfo.barId}/chat/${chatUserId}`);
  };

  // Leave the bar
  const leaveBar = () => {
    // Remove profile from database
    if (userId) {
      supabase.from('bar_profiles').delete().eq('id', userId).then(({ error }) => {
        if (error) {
          console.error('Erro ao remover perfil:', error);
        }
      });
    }
    
    // Clear sessionStorage
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

  return {
    barInfo,
    userProfile,
    userId,
    connectedUsers,
    isLoading,
    createProfile,
    startChat,
    leaveBar
  };
};

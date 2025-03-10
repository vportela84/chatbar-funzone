
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConnectedUser, BarInfo } from '@/types/bar';

export const useBarUsers = (barInfo: BarInfo | null, userId: string | null) => {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
          console.log('Dados de perfis carregados para o bar:', data);
          // Inicializar todos os usuários como online por padrão, até que o canal de presença atualize
          const usersWithPresence = data?.map(user => ({
            id: user.id,
            name: user.name,
            table_id: user.table_id,
            photo: user.photo,
            interest: user.interest,
            online: true // Assume online until presence channel says otherwise
          })) || [];
          
          setConnectedUsers(usersWithPresence);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (barInfo) {
      fetchConnectedUsers();
      
      // Setup database changes channel for user profile updates
      const dbChannel = supabase
        .channel('bar_profiles_changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'bar_profiles',
          filter: `bar_id=eq.${barInfo.barId}`
        }, (payload) => {
          console.log('Novo perfil detectado via Supabase Realtime:', payload);
          
          // Adicionar o novo usuário à lista
          setConnectedUsers(current => {
            // Verificar se o usuário já existe
            const userExists = current.some(user => user.id === payload.new.id);
            if (userExists) return current;
            
            const newUser: ConnectedUser = {
              id: payload.new.id,
              name: payload.new.name,
              table_id: payload.new.table_id,
              photo: payload.new.photo,
              interest: payload.new.interest,
              online: true // Inicialmente online
            };
            
            // Notificar sobre novo usuário apenas se não for o usuário atual
            if (payload.new.id !== userId) {
              toast({
                title: "Novo usuário",
                description: `${payload.new.name} entrou no bar`
              });
            }
            
            return [...current, newUser];
          });
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'bar_profiles',
          filter: `bar_id=eq.${barInfo.barId}`
        }, (payload) => {
          console.log('Usuário removido via Supabase Realtime:', payload);
          
          // Remover o usuário da lista
          setConnectedUsers(current => 
            current.filter(user => user.id !== payload.old.id)
          );
          
          // Notificar sobre usuário removido apenas se não for o usuário atual
          if (payload.old.id !== userId) {
            toast({
              title: "Usuário saiu",
              description: `${payload.old.name} saiu do bar`
            });
          }
        })
        .subscribe((status) => {
          console.log('Status da inscrição no canal para mudanças no banco de dados:', status);
        });
      
      // Setup presence channel for the specific bar
      const presenceChannelName = `presence:bar:${barInfo.barId}`;
      const presenceChannel = supabase.channel(presenceChannelName, {
        config: {
          presence: {
            key: presenceChannelName,
          },
        },
      });
      
      // Set up presence events
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          // Get current state of all presences in the channel
          const newState = presenceChannel.presenceState();
          console.log('Presence sync in bar users:', newState);
          
          // Extract all presence objects from the state
          const allPresences = Object.values(newState).flat();
          
          // Update users with their online status based on explicit online field
          setConnectedUsers(currentUsers => {
            return currentUsers.map(user => {
              // Find user's presence objects
              const userPresences = allPresences.filter(
                (presence: any) => presence.userId === user.id
              );
              
              // If we find a presence with online=false, mark as offline
              const isExplicitlyOffline = userPresences.some(
                (presence: any) => presence.online === false
              );
              
              // Only change to offline if explicitly marked
              return {
                ...user,
                online: isExplicitlyOffline ? false : user.online
              };
            });
          });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('Presence join in bar users:', key, newPresences);
          
          // Check if any presence has offline status
          const offlinePresence = newPresences.find((presence: any) => 
            presence.online === false
          );
          
          if (offlinePresence) {
            // Update user status to offline immediately
            setConnectedUsers(currentUsers => 
              currentUsers.map(user => {
                if (user.id === offlinePresence.userId) {
                  return { ...user, online: false };
                }
                return user;
              })
            );
            
            if (offlinePresence.userId !== userId) {
              toast({
                title: "Usuário offline",
                description: `${offlinePresence.name || 'Alguém'} está offline agora`,
              });
            }
          } 
        })
        .subscribe();
      
      // Clean up channels when component unmounts
      return () => {
        supabase.removeChannel(presenceChannel);
        supabase.removeChannel(dbChannel);
      };
    }
  }, [barInfo, toast, userId]);

  return {
    connectedUsers,
    isLoading
  };
};

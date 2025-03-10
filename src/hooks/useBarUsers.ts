
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
          // Inicializar todos como online por padrão, até que o canal de presença indique o contrário
          const usersWithPresence = data?.map(user => ({
            ...user,
            online: true
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
      
      // Setup presence channel for the specific bar
      const presenceChannelName = `presence:bar:${barInfo.barId}`;
      const presenceChannel = supabase.channel(presenceChannelName);
      
      // Set up presence events
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          // Get current state of all presences in the channel
          const newState = presenceChannel.presenceState();
          console.log('Presence sync:', newState);
          
          // Update users with their online status based on explicit online field
          setConnectedUsers(currentUsers => {
            return currentUsers.map(user => {
              // Verificar se há informação de presença para este usuário
              const userPresences = Object.values(newState)
                .flat()
                .filter((presence: any) => presence.userId === user.id);
              
              // Se não houver informação de presença, manter como online
              // Se houver e alguma delas tiver online = false, considerar offline
              const isUserOffline = userPresences.length > 0 && 
                userPresences.some((presence: any) => presence.online === false);
              
              return {
                ...user,
                online: !isUserOffline // Se não foi marcado explicitamente como offline, considerar online
              };
            });
          });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
          
          // Verificar se alguma presença tem status online = false
          const offlinePresence = newPresences.find((presence: any) => presence.online === false);
          
          if (offlinePresence && offlinePresence.name) {
            toast({
              title: "Usuário offline",
              description: `${offlinePresence.name} está offline agora`,
            });
          } else if (newPresences && newPresences.length > 0 && newPresences[0].name) {
            toast({
              title: "Usuário online",
              description: `${newPresences[0].name || 'Alguém'} está online agora`,
            });
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
          
          // Evento de leave só é chamado quando a conexão é perdida, não quando o usuário clica em sair
          // Por isso, não fazemos nada aqui pois o usuário só deve ficar offline quando clicar em sair
        });
      
      // Setup database changes channel for user profile updates
      const dbChannel = supabase
        .channel('bar_profiles_changes')
        .on('postgres_changes', {
          event: '*', // Listen for INSERT, UPDATE and DELETE events
          schema: 'public',
          table: 'bar_profiles',
          filter: `bar_id=eq.${barInfo.barId}`
        }, (payload) => {
          console.log('Profile changes:', payload);
          
          // When a new user joins (INSERT)
          if (payload.eventType === 'INSERT') {
            const newUser = payload.new as ConnectedUser;
            setConnectedUsers(current => {
              // Check if user already exists to avoid duplicates
              const userExists = current.some(user => user.id === newUser.id);
              if (userExists) return current;
              return [...current, { ...newUser, online: true }]; // Inicialmente online
            });
            
            // Show notification for new user
            if (newUser.id !== userId) {
              toast({
                title: "Novo usuário",
                description: `${newUser.name} entrou no bar`
              });
            }
          }
          
          // When a user leaves (DELETE)
          else if (payload.eventType === 'DELETE') {
            const deletedUser = payload.old as ConnectedUser;
            setConnectedUsers(current => 
              current.filter(user => user.id !== deletedUser.id)
            );
            
            // Show notification only if it's not the current user
            if (deletedUser.id !== userId) {
              toast({
                title: "Usuário saiu",
                description: `${deletedUser.name} saiu do bar`
              });
            }
          }
          
          // When a user updates their profile (UPDATE)
          else if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new as ConnectedUser;
            setConnectedUsers(current => 
              current.map(user => user.id === updatedUser.id ? 
                { ...updatedUser, online: user.online } : 
                user
              )
            );
          }
        });
      
      // Subscribe to both channels
      presenceChannel.subscribe();
      dbChannel.subscribe();
      
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

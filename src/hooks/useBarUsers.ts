
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
            ...user,
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
          
          // Update users with their online status based on explicit online field
          setConnectedUsers(currentUsers => {
            return currentUsers.map(user => {
              // Para cada usuário, verifica se há informação de presença
              const userPresences = Object.values(newState)
                .flat()
                .filter((presence: any) => presence.userId === user.id);
              
              // Só marcar como offline se tiver presença explícita com online=false
              // Se não tiver presença ou não tiver campo online=false, considerar online
              const isExplicitlyOffline = userPresences.length > 0 && 
                userPresences.some((presence: any) => presence.online === false);
              
              return {
                ...user,
                online: !isExplicitlyOffline
              };
            });
          });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('Presence join in bar users:', key, newPresences);
          
          // Check if any presence has offline status
          const offlinePresence = newPresences.find((presence: any) => presence.online === false);
          
          if (offlinePresence) {
            // Update user status to offline immediately
            setConnectedUsers(currentUsers => 
              currentUsers.map(user => 
                user.id === offlinePresence.userId 
                  ? { ...user, online: false } 
                  : user
              )
            );
            
            if (offlinePresence.userId !== userId) {
              toast({
                title: "Usuário offline",
                description: `${offlinePresence.name || 'Alguém'} está offline agora`,
              });
            }
          } else if (newPresences.length > 0) {
            // Update users to online if they're in the presence list
            const onlineUserIds = newPresences
              .filter((presence: any) => presence.online !== false)
              .map((presence: any) => presence.userId);
            
            if (onlineUserIds.length > 0) {
              setConnectedUsers(currentUsers => 
                currentUsers.map(user => 
                  onlineUserIds.includes(user.id) 
                    ? { ...user, online: true } 
                    : user
                )
              );
              
              // Only show notification if it's not the current user
              const newUserPresence = newPresences.find(
                (presence: any) => presence.userId !== userId
              );
              
              if (newUserPresence && newUserPresence.name) {
                toast({
                  title: "Usuário online",
                  description: `${newUserPresence.name} está online agora`,
                });
              }
            }
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left presence event:', key, leftPresences);
          // We don't automatically mark users as offline on leave
          // They are only marked offline if they explicitly set online=false
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
          console.log('DB change event for profiles:', payload);
          
          // When a new user joins (INSERT)
          if (payload.eventType === 'INSERT') {
            const newUser = payload.new as ConnectedUser;
            setConnectedUsers(current => {
              // Check if user already exists to avoid duplicates
              const userExists = current.some(user => user.id === newUser.id);
              if (userExists) return current;
              return [...current, { ...newUser, online: true }]; // Initially online
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
            
            // Remove the user from the list
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
                { ...updatedUser, online: user.online } : // Preserve online status
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

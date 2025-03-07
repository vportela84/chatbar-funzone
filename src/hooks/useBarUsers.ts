
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConnectedUser, BarInfo, PresenceState } from '@/types/bar';

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
          // Initialize all users as offline by default
          const usersWithPresence = data?.map(user => ({
            ...user,
            online: false
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
          
          // Update users with their online status
          setConnectedUsers(currentUsers => {
            return currentUsers.map(user => {
              // Check if this user has a presence state
              const userPresence = Object.values(newState)
                .flat()
                .find((presence: any) => presence.userId === user.id);
              
              return {
                ...user,
                online: !!userPresence && userPresence.status === 'online'
              };
            });
          });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
          
          // Handle new user joining (already handled by sync event)
          toast({
            title: "Usuário online",
            description: `${newPresences[0]?.name || 'Alguém'} está online agora`,
          });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
          
          // Handle user leaving (already handled by sync event)
          if (leftPresences[0]?.userId !== userId) {
            toast({
              title: "Usuário offline",
              description: `${leftPresences[0]?.name || 'Alguém'} está offline agora`,
            });
          }
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
              return [...current, { ...newUser, online: false }];
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
          }
          
          // When a user updates their profile (UPDATE)
          else if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new as ConnectedUser;
            setConnectedUsers(current => 
              current.map(user => user.id === updatedUser.id ? { ...updatedUser, online: user.online } : user)
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


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
          setConnectedUsers(data || []);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (barInfo) {
      fetchConnectedUsers();
      
      // Setup realtime channel for connected users updates
      const channel = supabase
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
              return [...current, newUser];
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
              current.map(user => user.id === updatedUser.id ? updatedUser : user)
            );
          }
        })
        .subscribe();
      
      // Clean up channel when component unmounts
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [barInfo, toast, userId]);

  return {
    connectedUsers,
    isLoading
  };
};

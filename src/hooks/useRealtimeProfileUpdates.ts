
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConnectedUser } from '@/types/bar';

/**
 * Hook para gerenciar atualizações em tempo real de perfis de usuários
 */
export const useRealtimeProfileUpdates = (
  barId: string | undefined, 
  userId: string | null,
  setConnectedUsers: React.Dispatch<React.SetStateAction<ConnectedUser[]>>
) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!barId) return;

    // Setup database changes channel for user profile updates
    const dbChannel = supabase
      .channel('bar_profiles_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bar_profiles',
        filter: `bar_id=eq.${barId}`
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
        filter: `bar_id=eq.${barId}`
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
    
    // Clean up channel when component unmounts
    return () => {
      supabase.removeChannel(dbChannel);
    };
  }, [barId, setConnectedUsers, toast, userId]);
};

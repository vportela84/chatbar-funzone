
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

    // Verificar formato do barId
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barId);
    console.log(`Configurando atualizações em tempo real para bar ${barId} (UUID: ${isUUID}) e usuário ${userId || 'não autenticado'}`);

    const column = isUUID ? 'uuid_bar_id' : 'bar_id';
    const channelName = `${column}_changes`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bar_profiles',
        filter: `${column}=eq.${barId}`
      }, (payload) => {
        console.log(`Novo perfil detectado via Supabase Realtime (${column}):`, payload);
        handleNewProfile(payload);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'bar_profiles',
        filter: `${column}=eq.${barId}`
      }, (payload) => {
        console.log(`Usuário removido via Supabase Realtime (${column}):`, payload);
        handleDeletedProfile(payload);
      })
      .subscribe((status) => {
        console.log(`Status da inscrição no canal para ${column}:`, status);
      });
    
    // Funções auxiliares para processar eventos
    const handleNewProfile = (payload: any) => {
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
    };
    
    const handleDeletedProfile = (payload: any) => {
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
    };
    
    // Clean up channel when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [barId, setConnectedUsers, toast, userId]);
};

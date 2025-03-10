
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

type UpdateHandler = (payload: any) => void;

export const useRealtimeDatabaseUpdates = (
  onProfileAdded: UpdateHandler,
  onProfileRemoved: UpdateHandler
) => {
  useEffect(() => {
    console.log('Inicializando hooks para atualizações em tempo real');
    
    // Configurar channel para receber atualizações em tempo real
    const channel = supabase
      .channel('admin-dashboard-profiles')
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'bar_profiles'
      }, (payload) => {
        console.log('Novo perfil detectado via Supabase Realtime:', payload);
        // Chamar o handler imediatamente
        onProfileAdded(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'bar_profiles'
      }, (payload) => {
        console.log('Perfil removido via Supabase Realtime:', payload);
        // Chamar o handler imediatamente
        onProfileRemoved(payload.old);
      })
      .subscribe((status) => {
        console.log('Status da inscrição no canal de realtime:', status);
        if (status !== 'SUBSCRIBED') {
          console.error('Falha ao se inscrever no canal de realtime:', status);
        }
      });

    // Limpar canal ao desmontar o componente
    return () => {
      console.log('Limpando canais de Supabase Realtime');
      supabase.removeChannel(channel);
    };
  }, [onProfileAdded, onProfileRemoved]);
};

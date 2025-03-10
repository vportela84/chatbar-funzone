
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
        onProfileAdded(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'bar_profiles'
      }, (payload) => {
        console.log('Perfil removido via Supabase Realtime:', payload);
        onProfileRemoved(payload.old);
      })
      .subscribe();

    // Limpar canal ao desmontar o componente
    return () => {
      console.log('Limpando canais de Supabase');
      supabase.removeAllChannels();
    };
  }, [onProfileAdded, onProfileRemoved]);
};

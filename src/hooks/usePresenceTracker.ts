
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para gerenciar a presença de usuários em um bar
 */
export const usePresenceTracker = () => {
  const { toast } = useToast();
  
  // Rastrear presença do usuário (online/offline)
  const trackPresence = async (barId: string, userId: string, name: string, status: 'online' | 'offline') => {
    if (!barId || !userId) {
      console.error('Tentativa de rastrear presença sem barId ou userId válidos');
      return;
    }
    
    console.log(`Rastreando presença para usuário ${name} (${userId}) no bar ${barId} como ${status}`);
    
    try {
      const presenceChannelName = `presence:bar:${barId}`;
      console.log(`Configurando canal de presença: ${presenceChannelName}`);
      
      const presenceChannel = supabase.channel(presenceChannelName, {
        config: {
          presence: {
            key: presenceChannelName,
          },
        },
      });
      
      if (status === 'online') {
        await presenceChannel.subscribe(async (statusResult) => {
          console.log(`Status da inscrição no canal de presença: ${statusResult}`);
          
          if (statusResult === 'SUBSCRIBED') {
            // Track the user's presence when they join
            try {
              const presenceTrackStatus = await presenceChannel.track({
                userId,
                name,
                online: true,
                lastSeen: new Date().toISOString()
              });
              console.log('Presença rastreada como ONLINE:', presenceTrackStatus);
            } catch (error) {
              console.error('Erro ao rastrear presença online:', error);
            }
          } else {
            console.warn(`Canal de presença não inscrito corretamente: ${statusResult}`);
          }
        });
      } else {
        // Quando o usuário sai explicitamente, marcamos como offline antes de remover o canal
        await presenceChannel.subscribe(async (statusResult) => {
          console.log(`Status da inscrição no canal de presença para marcar offline: ${statusResult}`);
          
          if (statusResult === 'SUBSCRIBED') {
            console.log(`Marcando usuário ${userId} (${name}) como OFFLINE antes de sair`);
            try {
              const trackStatus = await presenceChannel.track({
                userId,
                name,
                online: false,
                lastSeen: new Date().toISOString()
              });
              console.log('Usuário marcado como offline, status:', trackStatus);
              
              // Aguarda um momento para garantir que a atualização foi processada
              setTimeout(() => {
                supabase.removeChannel(presenceChannel);
                console.log('Canal de presença removido após marcar offline');
              }, 1000);
            } catch (error) {
              console.error('Erro ao rastrear presença offline:', error);
              supabase.removeChannel(presenceChannel);
            }
          } else {
            console.warn(`Canal de presença para marcar offline não inscrito corretamente: ${statusResult}`);
            supabase.removeChannel(presenceChannel);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao configurar canal de presença:', error);
      toast({
        title: "Aviso",
        description: "Não foi possível atualizar seu status online",
      });
    }
  };

  return { trackPresence };
};


import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para gerenciar a presença de usuários em um bar
 */
export const usePresenceTracker = () => {
  // Rastrear presença do usuário (online/offline)
  const trackPresence = async (barId: string, userId: string, name: string, status: 'online' | 'offline') => {
    if (!barId || !userId) return;
    
    console.log(`Tracking presence for user ${name} (${userId}) in bar ${barId} as ${status}`);
    
    const presenceChannelName = `presence:bar:${barId}`;
    const presenceChannel = supabase.channel(presenceChannelName, {
      config: {
        presence: {
          key: presenceChannelName,
        },
      },
    });
    
    if (status === 'online') {
      await presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track the user's presence when they join
          const presenceTrackStatus = await presenceChannel.track({
            userId,
            name,
            online: true,
            lastSeen: new Date().toISOString()
          });
          console.log('Presence tracked as ONLINE:', presenceTrackStatus);
        }
      });
    } else {
      // Quando o usuário sai explicitamente, marcamos como offline antes de remover o canal
      await presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Marking user ${userId} (${name}) as OFFLINE before leaving`);
          const trackStatus = await presenceChannel.track({
            userId,
            name,
            online: false,
            lastSeen: new Date().toISOString()
          });
          console.log('User marked as offline, status:', trackStatus);
          
          // Aguarda um momento para garantir que a atualização foi processada
          setTimeout(() => {
            supabase.removeChannel(presenceChannel);
          }, 1000);
        }
      });
    }
  };

  return { trackPresence };
};

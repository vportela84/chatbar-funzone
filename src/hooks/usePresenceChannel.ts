
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Bar } from '@/types/admin-dashboard';

// Definição de tipo para a presença recebida do canal Supabase
interface PresencePayload {
  userId?: string;
  online?: boolean;
  name?: string;
  presence_ref?: string;
  [key: string]: any;
}

export const usePresenceChannel = (bars: Bar[], setBars: React.Dispatch<React.SetStateAction<Bar[]>>) => {
  useEffect(() => {
    if (bars.length === 0) return;
    
    console.log('Inicializando canais de presença para os bares:', bars.map(b => b.id));
    
    // Criar um canal para cada bar
    const presenceChannels = bars.map(bar => {
      const channelName = `presence:bar:${bar.id}`;
      console.log(`Configurando canal de presença para ${bar.name} (${bar.id})`);
      
      const presenceChannel = supabase.channel(channelName, {
        config: {
          presence: {
            key: channelName,
          },
        },
      });
      
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = presenceChannel.presenceState();
          console.log(`Estado de presença atualizado para bar ${bar.id}:`, presenceState);
          
          setBars(currentBars => {
            return currentBars.map(currentBar => {
              if (currentBar.id !== bar.id) return currentBar;
              
              const updatedProfiles = currentBar.profiles.map(profile => {
                // Verificar se há presença para este perfil
                const presences = Object.values(presenceState).flat() as PresencePayload[];
                const userPresence = presences.find(presence => presence.userId === profile.id);
                
                // Se encontrou presença, atualize o estado online
                if (userPresence) {
                  return {
                    ...profile,
                    isOnline: userPresence.online !== false // Se não for explicitamente false, considere online
                  };
                }
                
                // Se não encontrou presença, mantenha o estado atual
                return profile;
              });

              console.log(`Bar ${currentBar.name}: atualizando ${updatedProfiles.length} perfis, ${updatedProfiles.filter(p => p.isOnline).length} online`);
              
              return {
                ...currentBar,
                profiles: updatedProfiles
              };
            });
          });
        })
        .on('presence', { event: 'join' }, async ({ key, newPresences }) => {
          console.log(`Novo usuário detectado no bar ${bar.id}:`, key, newPresences);
          
          // Verificar presenças offline
          const offlinePresence = newPresences.find((presence: PresencePayload) => 
            presence.online === false
          );
          
          if (offlinePresence) {
            console.log(`Usuário ${offlinePresence.name} marcado como offline explicitamente`);
            
            setBars(currentBars => {
              return currentBars.map(currentBar => {
                if (currentBar.id !== bar.id) return currentBar;
                
                const updatedProfiles = currentBar.profiles.map(profile => {
                  if (profile.id === offlinePresence.userId) {
                    return {
                      ...profile,
                      isOnline: false
                    };
                  }
                  return profile;
                });
                
                return {
                  ...currentBar,
                  profiles: updatedProfiles
                };
              });
            });
          }
        })
        .subscribe(async (status) => {
          console.log(`Status da inscrição no canal de presença para ${bar.id}:`, status);
          if (status === 'SUBSCRIBED') {
            // Enviar um ping inicial para atualizar o estado de presença
            await presenceChannel.track({ 
              userId: 'admin-dashboard',
              name: 'Admin Dashboard',
              online: true,
              timestamp: new Date().toISOString()
            });
            console.log(`Canal de presença para ${bar.id} iniciado com sucesso`);
          }
        });
      
      return presenceChannel;
    });

    // Cleanup function
    return () => {
      console.log('Limpando canais de presença');
      presenceChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [bars, setBars]);
};

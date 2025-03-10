
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Bar } from '@/types/admin-dashboard';

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
          
          // Atualizar estado online dos usuários
          setBars(currentBars => {
            return currentBars.map(currentBar => {
              if (currentBar.id !== bar.id) return currentBar;
              
              const updatedProfiles = currentBar.profiles.map(profile => {
                // Verificar se há presença para este perfil
                const presences = Object.values(presenceState).flat();
                
                // Encontrar qualquer presença relevante para este perfil
                const userPresence = presences.find((presence: any) => 
                  presence.userId === profile.id
                );
                
                let isOnline = profile.isOnline; // Manter estado atual por padrão
                
                // Verificar estado de presença somente se existir uma presença para este usuário
                if (userPresence && typeof userPresence.online === 'boolean') {
                  // Se userPresence.online é explicitamente false, definir como offline
                  if (userPresence.online === false) {
                    isOnline = false;
                  }
                }
                
                return {
                  ...profile,
                  isOnline
                };
              });

              console.log(`Bar ${currentBar.name}: atualizando ${updatedProfiles.length} perfis, ${updatedProfiles.filter(p => p.isOnline).length} online`);
              
              return {
                ...currentBar,
                profiles: updatedProfiles
              };
            });
          });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log(`Novo usuário detectado no bar ${bar.id}:`, key, newPresences);
          
          // Verificar se as novas presenças têm status offline explícito
          const offlinePresence = newPresences.find((presence: any) => 
            presence.online === false
          );
          
          if (offlinePresence) {
            console.log(`Usuário ${offlinePresence.name} marcado como offline explicitamente`);
            
            // Atualizar o status para offline imediatamente
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
              status: 'online',
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

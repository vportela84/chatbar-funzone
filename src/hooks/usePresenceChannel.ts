
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
                const hasPresence = Object.values(presenceState)
                  .some(presences => {
                    return presences.some((presence: any) => {
                      // Verificar o ID do usuário e campo online
                      const userId = presence.userId || '';
                      return userId === profile.barId && presence.online !== false;
                    });
                  });
                
                // Se não tiver presença ou presença explícita como offline, considerar como offline
                const isOnline = hasPresence;
                
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
          
          // Verificar se as novas presenças têm status online
          const onlinePresence = newPresences.find((presence: any) => presence.online !== false);
          const offlinePresence = newPresences.find((presence: any) => presence.online === false);
          
          if (offlinePresence) {
            console.log(`Usuário ${offlinePresence.name || offlinePresence.userId} marcado como offline explicitamente`);
          } else if (onlinePresence) {
            console.log(`Usuário ${onlinePresence.name || onlinePresence.userId} está online agora`);
          }
          
          // Forçar uma sincronização para atualizar status
          setTimeout(() => {
            const presenceState = presenceChannel.presenceState();
            console.log(`Estado de presença após join em ${bar.id}:`, presenceState);
          }, 500);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log(`Presença removida do bar ${bar.id}:`, key, leftPresences);
          
          // Forçar uma sincronização após evento leave
          setTimeout(() => {
            const presenceState = presenceChannel.presenceState();
            console.log(`Estado de presença após leave em ${bar.id}:`, presenceState);
          }, 500);
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

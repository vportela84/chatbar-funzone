
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
                // Melhorando a detecção de presença verificando tanto barId quanto tableId
                const isOnline = Object.values(presenceState)
                  .some(presences => {
                    return presences.some((presence: any) => {
                      const userId = presence.userId || '';
                      return userId === profile.barId || 
                             userId === profile.tableId || 
                             userId.includes(profile.tableId);
                    });
                  });
                
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
          console.log(`Novo usuário entrou no bar ${bar.id}:`, key, newPresences);
          
          // Forçar uma sincronização após uma entrada
          setTimeout(() => {
            const presenceState = presenceChannel.presenceState();
            console.log(`Estado de presença após entrada em ${bar.id}:`, presenceState);
          }, 300);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log(`Usuário saiu do bar ${bar.id}:`, key, leftPresences);
          
          // Forçar uma sincronização após uma saída
          setTimeout(() => {
            const presenceState = presenceChannel.presenceState();
            console.log(`Estado de presença após saída em ${bar.id}:`, presenceState);
          }, 300);
        })
        .subscribe(async (status) => {
          console.log(`Status da inscrição no canal de presença para ${bar.id}:`, status);
          if (status === 'SUBSCRIBED') {
            // Enviar um ping inicial para atualizar o estado de presença
            await presenceChannel.track({ userId: 'admin', status: 'online' });
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


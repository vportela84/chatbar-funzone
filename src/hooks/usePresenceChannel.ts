
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Bar } from '@/types/admin-dashboard';

// Definição de tipo para a presença recebida do canal Supabase
interface PresencePayload {
  userId?: string;
  online?: boolean;
  name?: string;
  lastSeen?: string;
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
          console.log(`Estado de presença SYNC para bar ${bar.id}:`, presenceState);
          
          const allPresences: PresencePayload[] = [];
          // Extrair todos os objetos de presença
          Object.values(presenceState).forEach(presences => {
            (presences as PresencePayload[]).forEach(presence => {
              allPresences.push(presence);
            });
          });
          
          console.log(`Bar ${bar.id} - Todas as presenças:`, allPresences);
          
          setBars(currentBars => {
            return currentBars.map(currentBar => {
              if (currentBar.id !== bar.id) return currentBar;
              
              const updatedProfiles = currentBar.profiles.map(profile => {
                // Procurar presença para este perfil
                const userPresence = allPresences.find(presence => presence.userId === profile.id);
                
                console.log(`Bar ${currentBar.name} - Perfil ${profile.name} (${profile.id}) - Presença:`, userPresence);
                
                if (userPresence) {
                  // Se a presença existe e não está explicitamente marcada como offline, considere online
                  const isOnline = userPresence.online !== false;
                  console.log(`Bar ${currentBar.name} - Perfil ${profile.name} - Status online:`, isOnline);
                  
                  return {
                    ...profile,
                    isOnline: isOnline
                  };
                }
                
                // Se não encontrar presença, considere offline
                return {
                  ...profile,
                  isOnline: false
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
          console.log(`EVENTO JOIN no bar ${bar.id}:`, key, newPresences);
          
          if (newPresences && newPresences.length > 0) {
            for (const presence of newPresences) {
              console.log(`Processando nova presença JOIN:`, presence);
              
              if (presence.userId && presence.userId !== 'admin-dashboard') {
                const isOffline = presence.online === false;
                
                console.log(`Usuário ${presence.userId} - Novo status: ${isOffline ? 'OFFLINE' : 'ONLINE'}`);
                
                setBars(currentBars => {
                  return currentBars.map(currentBar => {
                    if (currentBar.id !== bar.id) return currentBar;
                    
                    const userExistsInBar = currentBar.profiles.some(p => p.id === presence.userId);
                    
                    // Se o usuário não existir no bar, não fazemos nada - isso será tratado pelo canal de DB
                    if (!userExistsInBar) {
                      console.log(`Usuário ${presence.userId} não encontrado no bar ${currentBar.name}, ignorando evento de presença`);
                      return currentBar;
                    }
                    
                    const updatedProfiles = currentBar.profiles.map(profile => {
                      if (profile.id === presence.userId) {
                        return {
                          ...profile,
                          isOnline: !isOffline
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
            }
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log(`EVENTO LEAVE no bar ${bar.id}:`, key, leftPresences);
          
          // Tratamento similar ao JOIN, mas marcando os usuários como offline
          if (leftPresences && leftPresences.length > 0) {
            for (const presence of leftPresences) {
              console.log(`Processando presença que saiu LEAVE:`, presence);
              
              if (presence.userId && presence.userId !== 'admin-dashboard') {
                console.log(`Usuário ${presence.userId} saiu - Marcando como OFFLINE`);
                
                setBars(currentBars => {
                  return currentBars.map(currentBar => {
                    if (currentBar.id !== bar.id) return currentBar;
                    
                    const updatedProfiles = currentBar.profiles.map(profile => {
                      if (profile.id === presence.userId) {
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
            }
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

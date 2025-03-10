
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConnectedUser } from '@/types/bar';

/**
 * Hook responsável por sincronizar o estado de presença dos usuários
 */
export const usePresenceSync = (
  barId: string | undefined,
  setConnectedUsers: React.Dispatch<React.SetStateAction<ConnectedUser[]>>
) => {
  useEffect(() => {
    if (!barId) return;
    
    console.log(`Configurando canal de presença para bar: ${barId}`);
    
    // Setup presence channel for the specific bar
    const presenceChannelName = `presence:bar:${barId}`;
    const presenceChannel = supabase.channel(presenceChannelName, {
      config: {
        presence: {
          key: presenceChannelName,
        },
      },
    });
    
    // Set up presence events
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        // Get current state of all presences in the channel
        const newState = presenceChannel.presenceState();
        console.log('Presence sync in bar users:', newState);
        
        // Extract all presence objects from the state
        const allPresences = Object.values(newState).flat();
        console.log('Todos os objetos de presença:', allPresences);
        
        // Update users with their online status based on explicit online field
        setConnectedUsers(currentUsers => {
          console.log('Atualizando estado de presença para usuários:', currentUsers);
          return currentUsers.map(user => {
            // Find user's presence objects
            const userPresences = allPresences.filter(
              (presence: any) => presence.userId === user.id
            );
            
            console.log(`Presenças para usuário ${user.id}:`, userPresences);
            
            // Se encontrou alguma presença, atualize o status
            if (userPresences.length > 0) {
              // Verificar se alguma presença é explicitamente offline
              const isExplicitlyOffline = userPresences.some(
                (presence: any) => presence.online === false
              );
              
              return {
                ...user,
                online: !isExplicitlyOffline // Online a menos que marcado explicitamente como offline
              };
            }
            
            // Se não encontrou presença, mantenha o estado atual
            return user;
          });
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Presence join in bar users:', key, newPresences);
        
        // Verificar cada nova presença
        if (newPresences && newPresences.length > 0) {
          // Processar cada presença individuamente
          for (const presence of newPresences) {
            console.log('Processando presença:', presence);
            
            // Verificar se tem userId e não é o admin dashboard
            if (presence.userId && presence.userId !== 'admin-dashboard') {
              // Atualizar estado do usuário com base no valor online
              const isOffline = presence.online === false;
              
              setConnectedUsers(currentUsers => 
                currentUsers.map(user => {
                  if (user.id === presence.userId) {
                    console.log(`Atualizando usuário ${user.name} para ${isOffline ? 'offline' : 'online'}`);
                    return { ...user, online: !isOffline };
                  }
                  return user;
                })
              );
            }
          }
        }
      })
      .subscribe((status) => {
        console.log(`Status da inscrição no canal de presença ${presenceChannelName}:`, status);
      });
    
    // Clean up channel when component unmounts
    return () => {
      console.log(`Removendo canal de presença para bar: ${barId}`);
      supabase.removeChannel(presenceChannel);
    };
  }, [barId, setConnectedUsers]);
};

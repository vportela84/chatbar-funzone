
import { useState, useEffect } from 'react';
import { BarInfo, ConnectedUser } from '@/types/bar';
import { useBarProfileLoader } from './useBarProfileLoader';
import { useRealtimeProfileUpdates } from './useRealtimeProfileUpdates';
import { usePresenceSync } from './usePresenceSync';

export const useBarUsers = (barInfo: BarInfo | null, userId: string | null) => {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const { loadBarProfiles, isLoading } = useBarProfileLoader();

  // Carregar perfis iniciais
  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (!barInfo?.barId) return;
      
      const profiles = await loadBarProfiles(barInfo.barId);
      setConnectedUsers(profiles);
    };
    
    if (barInfo) {
      fetchConnectedUsers();
    }
  }, [barInfo, loadBarProfiles]);

  // Configurar atualizações em tempo real para mudanças de perfis no banco de dados
  useRealtimeProfileUpdates(barInfo?.barId, userId, setConnectedUsers);
  
  // Configurar sincronização de presença
  usePresenceSync(barInfo?.barId, setConnectedUsers);

  return {
    connectedUsers,
    isLoading
  };
};

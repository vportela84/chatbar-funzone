
import { useState, useEffect } from 'react';
import { BarInfo, ConnectedUser } from '@/types/bar';
import { useBarProfileLoader } from './useBarProfileLoader';
import { useRealtimeProfileUpdates } from './useRealtimeProfileUpdates';
import { usePresenceSync } from './usePresenceSync';
import { useToast } from '@/hooks/use-toast';

export const useBarUsers = (barInfo: BarInfo | null, userId: string | null) => {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const { loadBarProfiles, isLoading } = useBarProfileLoader();
  const { toast } = useToast();

  // Carregar perfis iniciais
  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (!barInfo?.barId) {
        console.error('Tentativa de carregar usuários sem um barId válido');
        return;
      }
      
      console.log(`Carregando perfis iniciais para bar: ${barInfo.barId}`);
      try {
        const profiles = await loadBarProfiles(barInfo.barId);
        console.log(`Perfis carregados (${profiles.length}):`, profiles);
        setConnectedUsers(profiles);
        
        if (profiles.length === 0) {
          console.warn('Nenhum perfil encontrado para este bar');
        }
      } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar perfis de usuários",
          variant: "destructive"
        });
      }
    };
    
    if (barInfo) {
      console.log('BarInfo disponível, buscando usuários conectados');
      fetchConnectedUsers();
    } else {
      console.warn('BarInfo não disponível, não é possível buscar usuários');
    }
  }, [barInfo, loadBarProfiles, toast]);

  // Configurar atualizações em tempo real para mudanças de perfis no banco de dados
  useRealtimeProfileUpdates(barInfo?.barId, userId, setConnectedUsers);
  
  // Configurar sincronização de presença
  usePresenceSync(barInfo?.barId, setConnectedUsers);

  return {
    connectedUsers,
    isLoading
  };
};

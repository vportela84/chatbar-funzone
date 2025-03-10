
import { useProfileCreation } from './useProfileCreation';
import { usePresenceTracker } from './usePresenceTracker';
import { UserProfile } from '@/types/bar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Hook que gerencia as principais ações relacionadas a perfis de usuário
 */
export const useProfileActions = (
  barInfo: { barId: string; barName: string; tableNumber: string } | null,
  userId: string | null,
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
) => {
  const { createNewProfile, removeProfile } = useProfileCreation();
  const { trackPresence } = usePresenceTracker();
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Cria um novo perfil de usuário e configura a sessão
   */
  const createProfile = async (profile: UserProfile) => {
    if (!barInfo) {
      console.error('Tentativa de criar perfil sem informações do bar');
      toast({
        title: "Erro",
        description: "Não foi possível criar seu perfil: informações do bar não disponíveis",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Iniciando criação de perfil:', profile, 'para bar:', barInfo);
      
      // Criar novo perfil no banco de dados
      const newUserId = await createNewProfile({
        ...profile,
        barId: barInfo.barId,
        tableId: barInfo.tableNumber
      });

      if (!newUserId) {
        console.error('Falha ao criar perfil: ID de usuário não retornado');
        return;
      }

      console.log('Perfil criado com sucesso, ID:', newUserId);

      // Armazenar perfil e ID na sessão
      sessionStorage.setItem('userProfile', JSON.stringify(profile));
      sessionStorage.setItem('userId', newUserId);

      // Atualizar estado React
      setUserProfile(profile);

      // Iniciar rastreamento de presença como online
      await trackPresence(barInfo.barId, newUserId, profile.name, 'online');
      
      console.log('Perfil criado e presença configurada com sucesso');
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a criação do perfil",
        variant: "destructive"
      });
    }
  };

  /**
   * Inicia um chat com outro usuário
   */
  const startChat = (partnerId: string, partnerName: string) => {
    if (!userId) {
      console.error('Tentativa de iniciar chat sem ID de usuário');
      return;
    }
    
    console.log(`Iniciando chat com ${partnerName} (${partnerId})`);
    navigate(`/chat/${userId}/${partnerId}`);
  };

  /**
   * Remove o perfil do usuário e encerra a sessão
   */
  const leaveBar = async () => {
    if (!userId || !barInfo) {
      console.error('Tentativa de sair sem ID de usuário ou informações do bar');
      return;
    }

    try {
      console.log('Iniciando processo de saída do bar');
      
      // Marcar usuário como offline antes de sair
      await trackPresence(barInfo.barId, userId, 'Usuário', 'offline');
      
      // Remover perfil do banco de dados
      const success = await removeProfile(userId);
      
      if (success) {
        // Limpar dados da sessão
        sessionStorage.removeItem('userProfile');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('currentBar');
        
        // Atualizar estado React
        setUserProfile(null);
        
        toast({
          title: "Saída confirmada",
          description: "Você saiu do bar com sucesso",
        });
        
        // Redirecionar para página inicial
        navigate('/');
        
        console.log('Processo de saída do bar concluído com sucesso');
      } else {
        console.error('Falha ao remover perfil do banco de dados');
        toast({
          title: "Erro",
          description: "Houve um problema ao sair do bar",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao sair do bar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar sair do bar",
        variant: "destructive"
      });
    }
  };

  return { createProfile, startChat, leaveBar };
};

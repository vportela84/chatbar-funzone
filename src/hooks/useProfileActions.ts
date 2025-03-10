
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, BarInfo } from '@/types/bar';
import { usePresenceTracker } from './usePresenceTracker';
import { useProfileManager } from './useProfileManager';
import { useChatManager } from './useChatManager';

export const useProfileActions = (barInfo: BarInfo | null, userId: string | null, setUserProfile: (profile: UserProfile | null) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackPresence } = usePresenceTracker();
  const { checkExistingProfile, updateExistingProfile, createNewProfile, removeProfile } = useProfileManager();
  const { startChat: initiateChat } = useChatManager();
  
  // Create a profile in the bar
  const createProfile = async (profile: UserProfile) => {
    try {
      if (!barInfo) {
        console.error('Informações do bar não disponíveis');
        return false;
      }
      
      // Verificar se já existe um perfil com este telefone neste bar
      let existingProfile = null;
      let newUserId = '';
      
      if (profile.phone) {
        existingProfile = await checkExistingProfile(profile.phone, barInfo.barId);
      }
      
      if (existingProfile) {
        console.log('Perfil existente encontrado:', existingProfile);
        newUserId = existingProfile.id;
        
        // Atualizar o perfil existente se necessário
        const updated = await updateExistingProfile(newUserId, {
          name: profile.name,
          interest: profile.interest,
          photo: profile.photo || existingProfile.photo
        });
        
        if (!updated) return false;
        
        toast({
          title: "Perfil recuperado",
          description: "Seu perfil anterior foi recuperado",
        });
        
        // Usar o perfil existente
        const userProfile = {
          name: profile.name,
          phone: existingProfile.phone || '',
          photo: profile.photo || existingProfile.photo,
          interest: profile.interest
        };
        
        // Salvar perfil no sessionStorage
        sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        sessionStorage.setItem('userId', newUserId);
        
        setUserProfile(userProfile);
      } else {
        // Criar novo perfil
        newUserId = await createNewProfile({
          ...profile,
          barId: barInfo.barId,
          tableId: barInfo.tableNumber
        });
        
        if (!newUserId) return false;
        
        // Save profile to sessionStorage
        sessionStorage.setItem('userProfile', JSON.stringify(profile));
        sessionStorage.setItem('userId', newUserId);
        
        setUserProfile(profile);
      }
      
      // Start tracking presence
      if (barInfo) {
        trackPresence(barInfo.barId, newUserId, profile.name, 'online');
      }
      
      return true;
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return false;
    }
  };

  // Start chat with a user
  const startChat = (chatUserId: string, userName: string) => {
    if (!barInfo) return;
    initiateChat(chatUserId, userName, barInfo.barId, barInfo.barName);
  };

  // Leave the bar
  const leaveBar = async () => {
    // Always mark as offline before removing profile
    if (barInfo && userId) {
      const storedProfile = sessionStorage.getItem('userProfile');
      const userName = storedProfile ? JSON.parse(storedProfile).name : '';
      console.log(`User ${userName} (${userId}) is leaving bar ${barInfo.barId}`);
      
      // Explicitly set presence to offline
      await trackPresence(barInfo.barId, userId, userName, 'offline');
      
      // Remove profile from database after a delay to ensure offline status is updated
      setTimeout(async () => {
        if (userId) {
          await removeProfile(userId);
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem('userProfile');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('currentBar');
        sessionStorage.removeItem('chatTarget');
        
        toast({
          title: "Bar desconectado",
          description: "Você saiu do bar",
        });
        
        navigate('/');
      }, 2000); // Increased delay to ensure offline status is processed
    } else {
      // Just clean up if no bar info or userId
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('currentBar');
      sessionStorage.removeItem('chatTarget');
      navigate('/');
    }
  };

  return {
    createProfile,
    startChat,
    leaveBar
  };
};

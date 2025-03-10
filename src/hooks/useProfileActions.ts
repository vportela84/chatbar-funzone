
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, BarInfo } from '@/types/bar';
import { usePresenceTracker } from './usePresenceTracker';
import { useProfileUpdate } from './useProfileUpdate';
import { useProfileCreation } from './useProfileCreation';
import { useChatManager } from './useChatManager';

export const useProfileActions = (
  barInfo: BarInfo | null, 
  userId: string | null, 
  setUserProfile: (profile: UserProfile | null) => void
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackPresence } = usePresenceTracker();
  const { checkExistingProfile, updateExistingProfile } = useProfileUpdate();
  const { createNewProfile, removeProfile } = useProfileCreation();
  const { startChat: initiateChat } = useChatManager();
  
  const createProfile = async (profile: UserProfile) => {
    try {
      if (!barInfo) {
        console.error('Informações do bar não disponíveis');
        return false;
      }
      
      let existingProfile = null;
      let newUserId = '';
      
      if (profile.phone) {
        existingProfile = await checkExistingProfile(profile.phone, barInfo.barId);
      }
      
      if (existingProfile) {
        console.log('Perfil existente encontrado:', existingProfile);
        newUserId = existingProfile.id;
        
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
        
        const userProfile = {
          name: profile.name,
          phone: existingProfile.phone || '',
          photo: profile.photo || existingProfile.photo,
          interest: profile.interest
        };
        
        sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        sessionStorage.setItem('userId', newUserId);
        
        setUserProfile(userProfile);
      } else {
        newUserId = await createNewProfile({
          ...profile,
          barId: barInfo.barId,
          tableId: barInfo.tableNumber
        });
        
        if (!newUserId) return false;
        
        sessionStorage.setItem('userProfile', JSON.stringify(profile));
        sessionStorage.setItem('userId', newUserId);
        
        setUserProfile(profile);
      }
      
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

  const startChat = (chatUserId: string, userName: string) => {
    if (!barInfo) return;
    initiateChat(chatUserId, userName, barInfo.barId, barInfo.barName);
  };

  const leaveBar = async () => {
    if (barInfo && userId) {
      const storedProfile = sessionStorage.getItem('userProfile');
      const userName = storedProfile ? JSON.parse(storedProfile).name : '';
      console.log(`User ${userName} (${userId}) is leaving bar ${barInfo.barId}`);
      
      await trackPresence(barInfo.barId, userId, userName, 'offline');
      
      setTimeout(async () => {
        if (userId) {
          await removeProfile(userId);
        }
        
        sessionStorage.removeItem('userProfile');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('currentBar');
        sessionStorage.removeItem('chatTarget');
        
        toast({
          title: "Bar desconectado",
          description: "Você saiu do bar",
        });
        
        navigate('/');
      }, 2000);
    } else {
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

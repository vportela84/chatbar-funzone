
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, BarInfo } from '@/types/bar';

export const useProfileActions = (barInfo: BarInfo | null, userId: string | null, setUserProfile: (profile: UserProfile | null) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track user presence
  const trackPresence = async (barId: string, userId: string, name: string, status: 'online' | 'offline') => {
    if (!barId || !userId) return;
    
    const presenceChannelName = `presence:bar:${barId}`;
    const presenceChannel = supabase.channel(presenceChannelName);
    
    if (status === 'online') {
      await presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track the user's presence when they join
          const presenceTrackStatus = await presenceChannel.track({
            userId,
            name,
            status: 'online',
            lastSeen: new Date().toISOString()
          });
          console.log('Presence tracked:', presenceTrackStatus);
        }
      });
    } else {
      // When user leaves, we don't need to set status to offline
      // as the presence system will automatically handle that
      // when the subscription is removed
      supabase.removeChannel(presenceChannel);
    }
  };

  // Create a profile in the bar
  const createProfile = async (profile: UserProfile) => {
    try {
      // Generate unique user ID
      const newUserId = crypto.randomUUID();
      
      // Save profile to sessionStorage
      sessionStorage.setItem('userProfile', JSON.stringify(profile));
      sessionStorage.setItem('userId', newUserId);
      
      // Save profile to the database
      const { error } = await supabase.from('bar_profiles').insert({
        id: newUserId,
        name: profile.name,
        phone: profile.phone || null,
        photo: profile.photo || null,
        interest: profile.interest,
        bar_id: barInfo?.barId,
        table_id: barInfo?.tableNumber
      });
      
      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu perfil",
          variant: "destructive"
        });
        return false;
      }
      
      setUserProfile(profile);
      
      // Start tracking presence
      if (barInfo) {
        trackPresence(barInfo.barId, newUserId, profile.name, 'online');
      }
      
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi criado com sucesso",
      });
      
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
    
    // Store chat info in sessionStorage
    sessionStorage.setItem('chatTarget', JSON.stringify({
      userId: chatUserId,
      userName,
      barId: barInfo.barId,
      barName: barInfo.barName
    }));
    
    // Navigate to chat page
    navigate(`/bar/${barInfo.barId}/chat/${chatUserId}`);
  };

  // Leave the bar
  const leaveBar = () => {
    // Set presence to offline
    if (barInfo && userId) {
      trackPresence(barInfo.barId, userId, '', 'offline');
    }
    
    // Remove profile from database
    if (userId) {
      supabase.from('bar_profiles').delete().eq('id', userId).then(({ error }) => {
        if (error) {
          console.error('Erro ao remover perfil:', error);
        }
      });
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
  };

  return {
    createProfile,
    startChat,
    leaveBar
  };
};

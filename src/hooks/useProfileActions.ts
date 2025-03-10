
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
    
    console.log(`Tracking presence for user ${name} (${userId}) in bar ${barId} as ${status}`);
    
    const presenceChannelName = `presence:bar:${barId}`;
    const presenceChannel = supabase.channel(presenceChannelName, {
      config: {
        presence: {
          key: presenceChannelName,
        },
      },
    });
    
    if (status === 'online') {
      await presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track the user's presence when they join
          const presenceTrackStatus = await presenceChannel.track({
            userId,
            name,
            online: true,
            lastSeen: new Date().toISOString()
          });
          console.log('Presence tracked as ONLINE:', presenceTrackStatus);
        }
      });
    } else {
      // Quando o usuário sai explicitamente, marcamos como offline antes de remover o canal
      await presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Marking user ${userId} (${name}) as OFFLINE before leaving`);
          const trackStatus = await presenceChannel.track({
            userId,
            name,
            online: false,
            lastSeen: new Date().toISOString()
          });
          console.log('User marked as offline, status:', trackStatus);
          
          // Aguarda um momento para garantir que a atualização foi processada
          setTimeout(() => {
            supabase.removeChannel(presenceChannel);
          }, 1000);
        }
      });
    }
  };

  // Verificar se já existe um perfil com o telefone fornecido
  const checkExistingProfile = async (phone: string, barId: string) => {
    if (!phone || !barId) return null;
    
    try {
      console.log(`Verificando perfil existente com telefone ${phone} no bar ${barId}`);
      
      // Alterado para não usar maybeSingle, e sim filtrar manualmente para evitar erro quando há múltiplos resultados
      const { data, error } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('phone', phone)
        .eq('bar_id', barId);
      
      if (error) {
        console.error('Erro ao verificar perfil existente:', error);
        return null;
      }
      
      // Se encontrou pelo menos um perfil, retorna o primeiro
      if (data && data.length > 0) {
        console.log('Perfil existente encontrado:', data[0]);
        return data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao verificar perfil existente:', error);
      return null;
    }
  };

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
        const { error } = await supabase
          .from('bar_profiles')
          .update({
            name: profile.name,
            interest: profile.interest,
            photo: profile.photo || existingProfile.photo
          })
          .eq('id', newUserId);
        
        if (error) {
          console.error('Erro ao atualizar perfil existente:', error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar seu perfil",
            variant: "destructive"
          });
          return false;
        }
        
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
        // Generate unique user ID para novo perfil
        newUserId = crypto.randomUUID();
        
        // Salvar novo perfil no banco de dados
        const { error } = await supabase.from('bar_profiles').insert({
          id: newUserId,
          name: profile.name,
          phone: profile.phone || null,
          photo: profile.photo || null,
          interest: profile.interest,
          bar_id: barInfo.barId,
          table_id: barInfo.tableNumber
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
        
        toast({
          title: "Perfil criado!",
          description: "Seu perfil foi criado com sucesso",
        });
        
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
          const { error } = await supabase.from('bar_profiles').delete().eq('id', userId);
          if (error) {
            console.error('Erro ao remover perfil:', error);
          } else {
            console.log('Perfil removido com sucesso após marcado como offline');
          }
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

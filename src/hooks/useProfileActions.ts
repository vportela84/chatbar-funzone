
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
    const presenceChannel = supabase.channel(presenceChannelName);
    
    try {
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
    } catch (error) {
      console.error('Error tracking presence:', error);
    }
  };

  // Verificar se já existe um perfil com o telefone fornecido
  const checkExistingProfile = async (phone: string, barId: string) => {
    if (!phone || !barId) return null;
    
    try {
      console.log(`Verificando perfil existente com telefone ${phone} no bar ${barId}`);
      const { data, error } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('phone', phone)
        .eq('bar_id', barId)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao verificar perfil existente:', error);
        return null;
      }
      
      return data;
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
        toast({
          title: "Erro",
          description: "Informações do bar não disponíveis",
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Criando perfil com informações:', { 
        nome: profile.name,
        telefone: profile.phone ? '(presente)' : '(não informado)',
        interesse: profile.interest,
        barId: barInfo.barId,
        mesa: barInfo.tableNumber
      });
      
      // Verificar se já existe um perfil com este telefone neste bar
      let existingProfile = null;
      let newUserId = '';
      
      if (profile.phone) {
        existingProfile = await checkExistingProfile(profile.phone, barInfo.barId);
        console.log('Resultado da verificação de perfil existente:', existingProfile ? 'Encontrado' : 'Não encontrado');
      }
      
      if (existingProfile) {
        console.log('Perfil existente encontrado:', existingProfile);
        newUserId = existingProfile.id;
        
        // Atualizar o perfil existente se necessário
        try {
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
        } catch (error: any) {
          console.error('Exceção ao atualizar perfil:', error.message);
          toast({
            title: "Erro",
            description: "Erro ao atualizar perfil: " + (error.message || "Erro desconhecido"),
            variant: "destructive"
          });
          return false;
        }
      } else {
        // Generate unique user ID para novo perfil
        newUserId = crypto.randomUUID();
        console.log('Novo ID de usuário gerado:', newUserId);
        
        // Salvar novo perfil no banco de dados
        try {
          const profileData = {
            id: newUserId,
            name: profile.name,
            phone: profile.phone || null,
            photo: profile.photo || null,
            interest: profile.interest,
            bar_id: barInfo.barId,
            table_id: barInfo.tableNumber
          };
          
          console.log('Salvando novo perfil:', profileData);
          
          const { error } = await supabase
            .from('bar_profiles')
            .insert(profileData);
          
          if (error) {
            console.error('Erro ao salvar perfil:', error);
            toast({
              title: "Erro",
              description: "Não foi possível salvar seu perfil: " + (error.message || ''),
              variant: "destructive"
            });
            return false;
          }
          
          toast({
            title: "Perfil criado!",
            description: "Seu perfil foi criado com sucesso",
          });
        } catch (error: any) {
          console.error('Exceção ao salvar novo perfil:', error.message);
          toast({
            title: "Erro",
            description: "Erro ao criar perfil: " + (error.message || "Erro desconhecido"),
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Save profile to sessionStorage
      console.log('Salvando perfil na sessão local');
      sessionStorage.setItem('userProfile', JSON.stringify(profile));
      sessionStorage.setItem('userId', newUserId);
      
      setUserProfile(profile);
      
      // Start tracking presence
      if (barInfo) {
        console.log('Iniciando rastreamento de presença');
        try {
          await trackPresence(barInfo.barId, newUserId, profile.name, 'online');
        } catch (error) {
          console.error('Erro ao iniciar rastreamento de presença:', error);
          // Continue anyway, não é crítico
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro geral na criação do perfil:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado: " + (error?.message || "Desconhecido"),
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

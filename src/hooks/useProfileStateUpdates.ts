
import { useState, useCallback } from 'react';
import { Profile, Bar } from '@/types/admin-dashboard';
import { useToast } from '@/hooks/use-toast';

export const useProfileStateUpdates = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const { toast } = useToast();

  const updateBarsWithNewProfile = useCallback((newProfile: any) => {
    console.log('Recebido novo perfil para adicionar:', newProfile);
    
    // Identificar o id do bar corretamente
    const barId = newProfile.uuid_bar_id || newProfile.bar_id;
    console.log('ID do bar identificado:', barId);
    
    if (!barId) {
      console.error('Perfil sem ID de bar válido:', newProfile);
      return;
    }

    // Usar um callback funcional para garantir que estamos trabalhando com o estado mais recente
    setBars(prevBars => {
      // Crie uma cópia do array de bares atual
      const updatedBars = [...prevBars];
      
      // Encontrar o índice do bar
      const barIndex = updatedBars.findIndex(bar => bar.id === barId);
      
      if (barIndex === -1) {
        console.log(`Bar com ID ${barId} não encontrado. Bar IDs disponíveis:`, 
          updatedBars.map(b => b.id));
        return prevBars;
      }
      
      // Verificar se o perfil já existe usando o ID único
      const profileExists = updatedBars[barIndex].profiles.some(
        profile => profile.id === newProfile.id
      );
      
      if (profileExists) {
        console.log('Perfil já existe, sem alterações:', newProfile);
        return prevBars;
      }
      
      // Criar novo perfil
      const newProfileObj: Profile = {
        id: newProfile.id,
        name: newProfile.name,
        phone: newProfile.phone || '',
        tableId: newProfile.table_id,
        barId: barId,
        photo: newProfile.photo,
        interest: newProfile.interest,
        isOnline: true // Inicialmente online
      };
      
      console.log('Adicionando novo perfil ao bar:', newProfileObj);
      
      // Atualizar o bar específico com o novo perfil
      const updatedBar = {
        ...updatedBars[barIndex],
        profiles: [...updatedBars[barIndex].profiles, newProfileObj]
      };
      
      updatedBars[barIndex] = updatedBar;
      
      console.log('Lista de bares atualizada:', updatedBars);
      return updatedBars;
    });

    toast({
      title: "Novo cliente!",
      description: `${newProfile.name} entrou no bar.`,
    });
  }, [toast]);

  const updateBarsWithRemovedProfile = useCallback((removedProfile: any) => {
    console.log('Removendo perfil:', removedProfile);
    
    // Identificar o id do bar corretamente
    const barId = removedProfile.uuid_bar_id || removedProfile.bar_id;
    
    if (!barId) {
      console.error('Perfil removido sem ID de bar válido:', removedProfile);
      return;
    }

    setBars(prevBars => {
      // Criar uma cópia do array de bares atual
      const updatedBars = [...prevBars];
      
      // Encontrar o índice do bar
      const barIndex = updatedBars.findIndex(bar => bar.id === barId);
      
      if (barIndex === -1) {
        console.log(`Bar com ID ${barId} não encontrado. Bar IDs disponíveis:`, 
          updatedBars.map(b => b.id));
        return prevBars;
      }
      
      if (removedProfile.isOfflinePermanent) {
        // Se o usuário saiu definitivamente, remover o perfil
        console.log('Removendo permanentemente o perfil:', removedProfile.name);
        const updatedProfiles = updatedBars[barIndex].profiles.filter(
          profile => profile.id !== removedProfile.id
        );
        
        updatedBars[barIndex] = {
          ...updatedBars[barIndex],
          profiles: updatedProfiles
        };
      } else {
        // Apenas marcar como offline se não for remoção permanente
        console.log('Marcando perfil como offline:', removedProfile.name);
        const updatedProfiles = updatedBars[barIndex].profiles.map(profile => {
          if (profile.id === removedProfile.id) {
            return {
              ...profile,
              isOnline: false
            };
          }
          return profile;
        });
        
        updatedBars[barIndex] = {
          ...updatedBars[barIndex],
          profiles: updatedProfiles
        };
      }
      
      console.log('Lista de bares após remoção/offline:', updatedBars);
      return updatedBars;
    });

    toast({
      title: "Cliente saiu",
      description: `${removedProfile.name} saiu do bar.`,
    });
  }, [toast]);

  return {
    bars,
    setBars,
    updateBarsWithNewProfile,
    updateBarsWithRemovedProfile
  };
};


import { useState } from 'react';
import { Profile, Bar } from '@/types/admin-dashboard';
import { useToast } from '@/hooks/use-toast';

export const useProfileStateUpdates = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const { toast } = useToast();

  const updateBarsWithNewProfile = (newProfile: any) => {
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
        console.log(`Bar com ID ${barId} não encontrado. Atualizando barIds disponíveis:`, 
          updatedBars.map(b => b.id));
        return prevBars;
      }
      
      // Verificar se o perfil já existe
      const profileExists = updatedBars[barIndex].profiles.some(
        profile => profile.name === newProfile.name && profile.tableId === newProfile.table_id
      );
      
      if (profileExists) {
        console.log('Perfil já existe, sem alterações:', newProfile);
        return prevBars;
      }
      
      // Criar novo perfil
      const newProfileObj: Profile = {
        name: newProfile.name,
        phone: newProfile.phone || '',
        tableId: newProfile.table_id,
        barId: barId,
        photo: newProfile.photo,
        interest: newProfile.interest,
        isOnline: true
      };
      
      console.log('Adicionando novo perfil ao bar:', newProfileObj);
      
      // Atualizar o bar específico com o novo perfil
      updatedBars[barIndex] = {
        ...updatedBars[barIndex],
        profiles: [...updatedBars[barIndex].profiles, newProfileObj]
      };
      
      console.log('Lista de bares atualizada:', updatedBars);
      return updatedBars;
    });

    toast({
      title: "Novo cliente!",
      description: `${newProfile.name} entrou no bar.`,
    });
  };

  const updateBarsWithRemovedProfile = (removedProfile: any) => {
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
        console.log(`Bar com ID ${barId} não encontrado`);
        return prevBars;
      }
      
      // Filtrar o perfil removido
      updatedBars[barIndex] = {
        ...updatedBars[barIndex],
        profiles: updatedBars[barIndex].profiles.filter(
          profile => !(profile.name === removedProfile.name && 
                     profile.tableId === removedProfile.table_id)
        )
      };
      
      console.log('Lista de bares após remoção:', updatedBars);
      return updatedBars;
    });

    toast({
      title: "Cliente saiu",
      description: `${removedProfile.name} saiu do bar.`,
    });
  };

  return {
    bars,
    setBars,
    updateBarsWithNewProfile,
    updateBarsWithRemovedProfile
  };
};

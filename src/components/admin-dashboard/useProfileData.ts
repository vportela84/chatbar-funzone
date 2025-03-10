
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId: string;
  photo?: string;
  interest?: string;
  isOnline?: boolean;
}

export interface Bar {
  id: string;
  name: string;
  profiles: Profile[];
}

export const useProfileData = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const translateInterest = (interest: string): string => {
    switch (interest) {
      case 'men':
        return 'Homens';
      case 'women':
        return 'Mulheres';
      case 'all':
      default:
        return 'Todos';
    }
  };

  const loadBarsAndProfiles = async () => {
    try {
      setIsLoading(true);
      const { data: barsData, error: barsError } = await supabase
        .from('bars')
        .select('*');

      if (barsError) throw barsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('bar_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      console.log('Dados de perfis carregados:', profilesData);

      const barsWithProfiles = barsData.map(bar => ({
        id: bar.id,
        name: bar.name,
        profiles: profilesData
          .filter(profile => profile.bar_id === bar.id || profile.uuid_bar_id === bar.id)
          .map(profile => ({
            name: profile.name,
            phone: profile.phone || '',
            tableId: profile.table_id,
            barId: profile.bar_id || profile.uuid_bar_id,
            photo: profile.photo,
            interest: profile.interest,
            isOnline: true
          }))
      }));

      console.log('Bares com perfis inicializados:', barsWithProfiles);
      setBars(barsWithProfiles);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações dos bares",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBarsWithNewProfile = (newProfile: any) => {
    console.log('Recebido novo perfil para adicionar:', newProfile);
    
    // Identificar o id do bar corretamente
    const barId = newProfile.uuid_bar_id || newProfile.bar_id;
    console.log('ID do bar identificado:', barId);
    
    if (!barId) {
      console.error('Perfil sem ID de bar válido:', newProfile);
      return;
    }

    setBars(prevBars => {
      // Encontrar o bar correto
      const barIndex = prevBars.findIndex(bar => bar.id === barId);
      
      if (barIndex === -1) {
        console.log(`Bar com ID ${barId} não encontrado na lista atual:`, prevBars);
        return prevBars;
      }
      
      // Verificar se o perfil já existe
      const profileExists = prevBars[barIndex].profiles.some(
        profile => profile.name === newProfile.name && profile.tableId === newProfile.table_id
      );
      
      if (profileExists) {
        console.log('Perfil já existe, sem alterações:', newProfile);
        return prevBars;
      }
      
      // Criar novo perfil
      const newProfileObj = {
        name: newProfile.name,
        phone: newProfile.phone || '',
        tableId: newProfile.table_id,
        barId: barId,
        photo: newProfile.photo,
        interest: newProfile.interest,
        isOnline: true
      };
      
      console.log('Adicionando novo perfil ao bar:', newProfileObj);
      
      // Criar uma nova cópia do array de bares
      const updatedBars = [...prevBars];
      
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
      // Encontrar o bar correto
      const barIndex = prevBars.findIndex(bar => bar.id === barId);
      
      if (barIndex === -1) {
        console.log(`Bar com ID ${barId} não encontrado`);
        return prevBars;
      }
      
      // Criar uma nova cópia do array de bares
      const updatedBars = [...prevBars];
      
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
  };

  useEffect(() => {
    console.log('Inicializando hook useProfileData');
    loadBarsAndProfiles();
    
    // Configurar channel para receber atualizações em tempo real
    const channel = supabase
      .channel('admin-dashboard-profiles')
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'bar_profiles'
      }, (payload) => {
        console.log('Novo perfil detectado:', payload);
        updateBarsWithNewProfile(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'bar_profiles'
      }, (payload) => {
        console.log('Perfil removido:', payload);
        updateBarsWithRemovedProfile(payload.old);
      })
      .subscribe();

    console.log('Canal de Supabase inscrito para atualizações em tempo real');

    return () => {
      console.log('Limpando canal de Supabase');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    bars,
    isLoading,
    loadBarsAndProfiles,
    translateInterest
  };
};


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

      const barsWithProfiles = barsData.map(bar => ({
        id: bar.id,
        name: bar.name,
        profiles: profilesData
          .filter(profile => profile.bar_id === bar.id)
          .map(profile => ({
            name: profile.name,
            phone: profile.phone || '',
            tableId: profile.table_id,
            barId: profile.bar_id,
            photo: profile.photo,
            interest: profile.interest,
            isOnline: true
          }))
      }));

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
    console.log('Atualizando bares com novo perfil:', newProfile);
    setBars(currentBars => {
      const updatedBars = currentBars.map(bar => {
        // Verifica o uuid_bar_id primeiro, depois o bar_id
        if (bar.id === newProfile.uuid_bar_id || bar.id === newProfile.bar_id) {
          const profileExists = bar.profiles.some(
            p => p.name === newProfile.name && p.tableId === newProfile.table_id
          );

          if (!profileExists) {
            return {
              ...bar,
              profiles: [
                ...bar.profiles,
                {
                  name: newProfile.name,
                  phone: newProfile.phone || '',
                  tableId: newProfile.table_id,
                  barId: newProfile.uuid_bar_id || newProfile.bar_id,
                  photo: newProfile.photo,
                  interest: newProfile.interest,
                  isOnline: true
                }
              ]
            };
          }
        }
        return bar;
      });

      console.log('Bares atualizados:', updatedBars);
      return updatedBars;
    });

    toast({
      title: "Novo cliente!",
      description: `${newProfile.name} entrou no bar.`,
    });
  };

  const updateBarsWithRemovedProfile = (removedProfile: any) => {
    console.log('Removendo perfil:', removedProfile);
    setBars(currentBars => {
      const updatedBars = currentBars.map(bar => {
        if (bar.id === removedProfile.uuid_bar_id || bar.id === removedProfile.bar_id) {
          return {
            ...bar,
            profiles: bar.profiles.filter(
              profile => !(profile.name === removedProfile.name && 
                         profile.tableId === removedProfile.table_id)
            )
          };
        }
        return bar;
      });

      console.log('Bares após remoção:', updatedBars);
      return updatedBars;
    });
  };

  useEffect(() => {
    loadBarsAndProfiles();
    
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

    return () => {
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

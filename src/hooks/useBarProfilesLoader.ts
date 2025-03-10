
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Bar, Profile } from '@/types/admin-dashboard';

export const useBarProfilesLoader = (setBars: React.Dispatch<React.SetStateAction<Bar[]>>) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

      // Inicializar os bares com os usuários e seus estados de presença
      const barsWithProfiles = barsData.map(bar => {
        // Filtrar perfis para este bar
        const barProfiles = profilesData
          .filter(profile => profile.bar_id === bar.id || profile.uuid_bar_id === bar.id)
          .map(profile => ({
            id: profile.id, // Adicionar o ID do perfil
            name: profile.name,
            phone: profile.phone || '',
            tableId: profile.table_id,
            barId: profile.bar_id || profile.uuid_bar_id,
            photo: profile.photo,
            interest: profile.interest,
            isOnline: false // Inicialmente, todos estão offline
          }));

        return {
          id: bar.id,
          name: bar.name,
          profiles: barProfiles
        };
      });

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

  return {
    isLoading,
    loadBarsAndProfiles
  };
};

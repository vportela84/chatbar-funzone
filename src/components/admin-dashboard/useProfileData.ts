
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

      // Vamos considerar que todos os usuários presentes na lista estão online
      // No futuro, podemos integrar com a funcionalidade de presença do Supabase
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
            isOnline: true // Definindo todos como online por enquanto
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

  useEffect(() => {
    loadBarsAndProfiles();
    // Atualiza a cada 30 segundos
    const interval = setInterval(loadBarsAndProfiles, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    bars,
    isLoading,
    loadBarsAndProfiles,
    translateInterest
  };
};

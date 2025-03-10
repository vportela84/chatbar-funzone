
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConnectedUser } from '@/types/bar';

/**
 * Hook responsável por carregar os perfis de usuários de um bar
 */
export const useBarProfileLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadBarProfiles = async (barId: string) => {
    if (!barId) {
      setIsLoading(false);
      return [];
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('bar_id', barId);
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários conectados",
          variant: "destructive"
        });
        return [];
      } else {
        console.log('Dados de perfis carregados para o bar:', data);
        // Inicializar todos os usuários como online por padrão, até que o canal de presença atualize
        const usersWithPresence: ConnectedUser[] = data?.map(user => ({
          id: user.id,
          name: user.name,
          table_id: user.table_id,
          photo: user.photo,
          interest: user.interest,
          online: true // Assume online until presence channel says otherwise
        })) || [];
        
        return usersWithPresence;
      }
    } catch (error) {
      console.error('Erro:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadBarProfiles,
    isLoading
  };
};

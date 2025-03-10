
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
      console.error('Tentativa de carregar perfis sem um ID de bar válido');
      setIsLoading(false);
      return [];
    }
    
    try {
      setIsLoading(true);
      console.log(`Carregando perfis para o bar: ${barId}`);
      
      // Consulta corrigida para buscar perfis com ambos os tipos de barId
      const { data, error } = await supabase
        .from('bar_profiles')
        .select('*')
        .or(`bar_id.eq.${barId},uuid_bar_id.eq.${barId}`);
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários conectados: " + error.message,
          variant: "destructive"
        });
        return [];
      }
      
      console.log(`Carregados ${data?.length || 0} perfis para o bar ${barId}:`, data);
      
      if (!data || data.length === 0) {
        console.warn(`Nenhum perfil encontrado para o bar ${barId}`);
        return [];
      }
      
      // Inicializar todos os usuários como online por padrão, até que o canal de presença atualize
      const usersWithPresence: ConnectedUser[] = data.map(user => ({
        id: user.id,
        name: user.name,
        table_id: user.table_id,
        photo: user.photo,
        interest: user.interest,
        online: true // Assume online until presence channel says otherwise
      }));
      
      return usersWithPresence;
    } catch (error: any) {
      console.error('Erro ao carregar perfis:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar os perfis: " + (error.message || 'Erro desconhecido'),
        variant: "destructive"
      });
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

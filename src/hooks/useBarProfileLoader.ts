
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
      
      // Nova abordagem: duas consultas separadas e união dos resultados
      const { data: dataNumeric, error: errorNumeric } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('bar_id', barId);
      
      const { data: dataUuid, error: errorUuid } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('uuid_bar_id', barId);
      
      // Verificar erros em ambas as consultas
      if (errorNumeric) {
        console.error('Erro ao buscar usuários (bar_id):', errorNumeric);
      }
      
      if (errorUuid) {
        console.error('Erro ao buscar usuários (uuid_bar_id):', errorUuid);
      }
      
      if (errorNumeric && errorUuid) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários conectados",
          variant: "destructive"
        });
        return [];
      }
      
      // Combinar os resultados das duas consultas
      const combinedData = [
        ...(dataNumeric || []),
        ...(dataUuid || [])
      ];
      
      console.log(`Carregados ${combinedData.length} perfis para o bar ${barId}:`, combinedData);
      
      if (combinedData.length === 0) {
        console.warn(`Nenhum perfil encontrado para o bar ${barId}`);
        return [];
      }
      
      // Inicializar todos os usuários como online por padrão
      const usersWithPresence: ConnectedUser[] = combinedData.map(user => ({
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

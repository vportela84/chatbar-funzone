
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
      
      // Verificar formato do barId
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barId);
      console.log('O barId na consulta é UUID?', isUUID, barId);
      
      let profiles = [];
      
      if (isUUID) {
        // Se for UUID, consultar por uuid_bar_id
        console.log('Consultando por uuid_bar_id:', barId);
        const { data, error } = await supabase
          .from('bar_profiles')
          .select('*')
          .eq('uuid_bar_id', barId);
        
        if (error) {
          console.error('Erro ao buscar usuários por uuid_bar_id:', error);
          throw error;
        }
        
        profiles = data || [];
        console.log(`Encontrados ${profiles.length} perfis por uuid_bar_id:`, profiles);
      } else {
        // Se não for UUID, consultar por bar_id
        console.log('Consultando por bar_id:', barId);
        const { data, error } = await supabase
          .from('bar_profiles')
          .select('*')
          .eq('bar_id', barId);
        
        if (error) {
          console.error('Erro ao buscar usuários por bar_id:', error);
          throw error;
        }
        
        profiles = data || [];
        console.log(`Encontrados ${profiles.length} perfis por bar_id:`, profiles);
      }
      
      if (profiles.length === 0) {
        console.warn(`Nenhum perfil encontrado para o bar ${barId}`);
        return [];
      }
      
      // Inicializar todos os usuários como online por padrão
      const usersWithPresence: ConnectedUser[] = profiles.map(user => ({
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


import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/bar';

/**
 * Hook para gerenciar operações relacionadas a perfis de usuários
 */
export const useProfileManager = () => {
  const { toast } = useToast();

  // Verificar se já existe um perfil com o telefone fornecido
  const checkExistingProfile = async (phone: string, barId: string) => {
    if (!phone || !barId) return null;
    
    try {
      console.log(`Verificando perfil existente com telefone ${phone} no bar ${barId}`);
      
      // Alterado para não usar maybeSingle, e sim filtrar manualmente para evitar erro quando há múltiplos resultados
      const { data, error } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('phone', phone)
        .eq('bar_id', barId);
      
      if (error) {
        console.error('Erro ao verificar perfil existente:', error);
        return null;
      }
      
      // Se encontrou pelo menos um perfil, retorna o primeiro
      if (data && data.length > 0) {
        console.log('Perfil existente encontrado:', data[0]);
        return data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao verificar perfil existente:', error);
      return null;
    }
  };

  // Atualizar um perfil existente
  const updateExistingProfile = async (profileId: string, profileData: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('bar_profiles')
        .update({
          name: profileData.name,
          interest: profileData.interest,
          photo: profileData.photo
        })
        .eq('id', profileId);
      
      if (error) {
        console.error('Erro ao atualizar perfil existente:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar seu perfil",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  // Criar um novo perfil
  const createNewProfile = async (profileData: UserProfile & { barId: string, tableId: string }) => {
    try {
      const newUserId = crypto.randomUUID();
      
      const { error } = await supabase.from('bar_profiles').insert({
        id: newUserId,
        name: profileData.name,
        phone: profileData.phone || null,
        photo: profileData.photo || null,
        interest: profileData.interest,
        bar_id: profileData.barId,
        table_id: profileData.tableId
      });
      
      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu perfil",
          variant: "destructive"
        });
        return null;
      }
      
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi criado com sucesso",
      });
      
      return newUserId;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }
  };

  // Remover um perfil
  const removeProfile = async (userId: string) => {
    try {
      const { error } = await supabase.from('bar_profiles').delete().eq('id', userId);
      
      if (error) {
        console.error('Erro ao remover perfil:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao remover perfil:', error);
      return false;
    }
  };

  return {
    checkExistingProfile,
    updateExistingProfile,
    createNewProfile,
    removeProfile
  };
};

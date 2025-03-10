
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/bar';
import { supabase } from '@/integrations/supabase/client';

export const useProfileCreation = () => {
  const { toast } = useToast();

  /**
   * Verifica se um usuário com o número de telefone fornecido já existe
   */
  const checkExistingUser = async (phone: string, barId: string): Promise<any | null> => {
    if (!phone || !barId) return null;
    
    console.log('Verificando se usuário já existe:', { phone, barId });
    
    // Verificar formato do barId
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barId);
    
    try {
      let { data: existingUser, error } = null as any;
      
      if (isUUID) {
        // Buscar por uuid_bar_id
        ({ data: existingUser, error } = await supabase
          .from('bar_profiles')
          .select('*')
          .eq('uuid_bar_id', barId)
          .eq('phone', phone)
          .maybeSingle());
      } else {
        // Buscar por bar_id 
        ({ data: existingUser, error } = await supabase
          .from('bar_profiles')
          .select('*')
          .eq('bar_id', barId)
          .eq('phone', phone)
          .maybeSingle());
      }
      
      if (error) throw error;
      
      console.log('Resultado da verificação de usuário existente:', existingUser);
      return existingUser;
    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
      return null;
    }
  };

  const createNewProfile = async (profileData: UserProfile & { barId: string, tableId: string }) => {
    try {
      // Se o telefone estiver preenchido, verificar se o usuário já existe
      let existingUser = null;
      if (profileData.phone) {
        existingUser = await checkExistingUser(profileData.phone, profileData.barId);
      }
      
      // Se encontrou usuário existente, retornar o ID dele
      if (existingUser) {
        console.log('Usuário já existe, retornando ID existente:', existingUser.id);
        toast({
          title: "Perfil recuperado!",
          description: "Seu perfil foi recuperado com sucesso",
        });
        return existingUser.id;
      }
      
      // Se não encontrou, criar novo usuário
      const newUserId = crypto.randomUUID();
      console.log('Criando novo perfil:', profileData);
      
      // Verificar formato do barId
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileData.barId);
      console.log('O barId é UUID?', isUUID, profileData.barId);
      
      // Criar objeto com os dados do perfil
      const profileToInsert = {
        id: newUserId,
        name: profileData.name,
        phone: profileData.phone || null,
        photo: profileData.photo || null,
        interest: profileData.interest,
        table_id: profileData.tableId,
        uuid_bar_id: isUUID ? profileData.barId : null,
        bar_id: isUUID ? null : profileData.barId
      };
      
      console.log('Dados a serem inseridos:', profileToInsert);
      
      const { error, data } = await supabase.from('bar_profiles').insert(profileToInsert).select();
      
      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu perfil: " + error.message,
          variant: "destructive"
        });
        return null;
      }
      
      console.log('Perfil criado com sucesso, dados retornados:', data);
      console.log('Perfil criado com sucesso, ID:', newUserId);
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi criado com sucesso",
      });
      
      return newUserId;
    } catch (error: any) {
      console.error('Erro ao criar perfil:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao criar seu perfil: " + (error.message || 'Erro desconhecido'),
        variant: "destructive"
      });
      return null;
    }
  };

  const removeProfile = async (userId: string) => {
    try {
      console.log('Removendo perfil de usuário:', userId);
      const { error } = await supabase
        .from('bar_profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Erro ao remover perfil:', error);
        return false;
      }
      
      console.log('Perfil removido com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao remover perfil:', error);
      return false;
    }
  };

  return {
    createNewProfile,
    removeProfile
  };
};

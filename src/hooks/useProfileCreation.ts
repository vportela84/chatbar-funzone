
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/bar';
import { supabase } from '@/integrations/supabase/client';

export const useProfileCreation = () => {
  const { toast } = useToast();

  const checkExistingUser = async (phone: string, barId: string): Promise<any | null> => {
    if (!phone || !barId) return null;
    
    console.log('Verificando usuário existente com telefone:', phone, 'no bar:', barId);
    
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barId);
      console.log('barId é UUID?', isUUID, barId);

      // Consulta direta usando os campos corretos com base no formato do barId
      const query = supabase
        .from('bar_profiles')
        .select('*')
        .eq('phone', phone);
      
      // Adicionar a condição correta com base no formato do ID do bar
      const { data, error } = await (isUUID 
        ? query.eq('uuid_bar_id', barId)
        : query.eq('bar_id', barId));
      
      if (error) {
        console.error('Erro ao verificar usuário existente:', error);
        throw error;
      }
      
      console.log('Usuários encontrados com o mesmo telefone no mesmo bar:', data);
      
      // Retornar o primeiro usuário encontrado, se houver
      if (data && data.length > 0) {
        return data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
      return null;
    }
  };

  const createNewProfile = async (profileData: UserProfile & { barId: string, tableId: string }) => {
    try {
      console.log('Iniciando criação/atualização de perfil:', profileData);
      
      // Verificar se usuário existe pelo número de telefone
      let existingUser = null;
      if (profileData.phone) {
        existingUser = await checkExistingUser(profileData.phone, profileData.barId);
      }
      
      // Se encontrou usuário existente, retornar o ID dele
      if (existingUser) {
        console.log('Usuário existente encontrado:', existingUser);
        toast({
          title: "Perfil recuperado!",
          description: "Seu perfil foi recuperado com sucesso",
        });
        return existingUser.id;
      }
      
      // Se não houver usuário existente, criar novo perfil
      const newUserId = crypto.randomUUID();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileData.barId);
      
      // Configurar os campos corretos com base no formato do ID do bar
      const profileToInsert = {
        id: newUserId,
        name: profileData.name,
        phone: profileData.phone || null,
        photo: profileData.photo || null,
        interest: profileData.interest,
        table_id: profileData.tableId,
        // Definir ambos os campos apropriadamente
        uuid_bar_id: isUUID ? profileData.barId : null,
        bar_id: !isUUID ? profileData.barId : null
      };
      
      console.log('Dados a serem inseridos:', profileToInsert);
      
      const { error, data } = await supabase
        .from('bar_profiles')
        .insert(profileToInsert)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu perfil: " + error.message,
          variant: "destructive"
        });
        return null;
      }
      
      console.log('Perfil criado com sucesso:', data);
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

import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/bar';
import { supabase } from '@/integrations/supabase/client';

export const useProfileCreation = () => {
  const { toast } = useToast();

  const checkExistingUser = async (phone: string, barId: string): Promise<any | null> => {
    if (!phone || !barId) return null;
    
    console.log('Verificando usuário existente:', { phone, barId });
    
    // Check if barId is UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barId);
    console.log('barId é UUID?', isUUID);
    
    try {
      // Query based on phone number first
      let query = supabase
        .from('bar_profiles')
        .select('*')
        .eq('phone', phone);

      // Then filter by the appropriate bar_id field
      if (isUUID) {
        query = query.eq('uuid_bar_id', barId);
      } else {
        query = query.eq('bar_id', barId);
      }

      const { data: existingUser, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Erro ao verificar usuário existente:', error);
        throw error;
      }
      
      console.log('Resultado da busca por usuário existente:', existingUser);
      return existingUser;
    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
      return null;
    }
  };

  const createNewProfile = async (profileData: UserProfile & { barId: string, tableId: string }) => {
    try {
      console.log('Iniciando criação/atualização de perfil:', profileData);
      
      // Check if user exists by phone number
      let existingUser = null;
      if (profileData.phone) {
        existingUser = await checkExistingUser(profileData.phone, profileData.barId);
      }
      
      // If found existing user, return their ID
      if (existingUser) {
        console.log('Usuário existente encontrado:', existingUser);
        toast({
          title: "Perfil recuperado!",
          description: "Seu perfil foi recuperado com sucesso",
        });
        return existingUser.id;
      }
      
      // If no existing user, create new profile
      const newUserId = crypto.randomUUID();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileData.barId);
      
      const profileToInsert = {
        id: newUserId,
        name: profileData.name,
        phone: profileData.phone || null,
        photo: profileData.photo || null,
        interest: profileData.interest,
        table_id: profileData.tableId,
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

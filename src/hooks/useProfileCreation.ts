
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/bar';
import { supabase } from '@/integrations/supabase/client';

export const useProfileCreation = () => {
  const { toast } = useToast();

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

  const removeProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('bar_profiles')
        .delete()
        .eq('id', userId);
      
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
    createNewProfile,
    removeProfile
  };
};


import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/bar';
import { supabase } from '@/integrations/supabase/client';

export const useProfileUpdate = () => {
  const { toast } = useToast();

  const checkExistingProfile = async (phone: string, barId: string) => {
    if (!phone || !barId) return null;
    
    try {
      console.log(`Verificando perfil existente com telefone ${phone} no bar ${barId}`);
      
      const { data, error } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('phone', phone)
        .eq('bar_id', barId);
      
      if (error) {
        console.error('Erro ao verificar perfil existente:', error);
        return null;
      }
      
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

  const updateExistingProfile = async (profileId: string, profile: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('bar_profiles')
        .update({
          name: profile.name,
          interest: profile.interest,
          photo: profile.photo
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

  return {
    checkExistingProfile,
    updateExistingProfile
  };
};

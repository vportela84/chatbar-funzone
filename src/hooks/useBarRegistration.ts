
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { PhotoFile } from './useMediaUpload';

interface UseBarRegistrationProps {
  name: string;
  ownerName: string;
  document: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  login: string;
  subscriptionPlan: string;
  description: string;
  logoFile: File | null;
  photos: PhotoFile[];
  uploadFile: (file: File, path: string) => Promise<string>;
  resetForm: () => void;
  resetMedia: () => void;
}

export const useBarRegistration = ({
  name,
  ownerName,
  document,
  address,
  number,
  neighborhood,
  city,
  state,
  phone,
  email,
  login,
  subscriptionPlan,
  description,
  logoFile,
  photos,
  uploadFile,
  resetForm,
  resetMedia
}: UseBarRegistrationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateBar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !address || !city) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do bar, endereço e cidade são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Upload do logo
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'logos');
      }

      // Upload das fotos
      const photoUrls = [];
      for (const photo of photos) {
        const photoUrl = await uploadFile(photo.file, 'photos');
        photoUrls.push(photoUrl);
      }

      const { data, error } = await supabase
        .from('bars')
        .insert([
          {
            name,
            owner_name: ownerName,
            document,
            address,
            number,
            neighborhood,
            city,
            state,
            phone,
            email,
            login,
            subscription_plan: subscriptionPlan,
            description,
            logo_url: logoUrl,
            photos_url: photoUrls.length > 0 ? photoUrls : null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Alterando a URL do QR code para o formato solicitado
        const qrCodeUrl = `https://www.barmatch.com.br/join/${data.id}`;
        
        // Atualiza o bar com o QR code
        const { error: updateError } = await supabase
          .from('bars')
          .update({ qr_code: qrCodeUrl })
          .eq('id', data.id);

        if (updateError) throw updateError;

        // Envia email com senha para o cliente (simulação - precisaria integrar com serviço de email)
        if (email) {
          console.log(`Email seria enviado para ${email} com senha temporária`);
        }
        
        resetForm();
        resetMedia();
        
        toast({
          title: "Bar cadastrado com sucesso!",
          description: "Seu novo bar foi cadastrado e já está disponível para monitoramento.",
        });
        
        // Redireciona para a página de monitoramento
        setTimeout(() => {
          navigate('/barmonitor');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar bar:', error);
      toast({
        title: "Erro ao cadastrar bar",
        description: error.message || "Não foi possível cadastrar o bar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return { handleCreateBar };
};

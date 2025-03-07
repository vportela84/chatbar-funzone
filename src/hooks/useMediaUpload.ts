
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export interface PhotoFile {
  file: File;
  preview: string;
}

export const useMediaUpload = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const { toast } = useToast();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (photos.length >= 5) {
        toast({
          title: "Limite de fotos atingido",
          description: "Você pode enviar no máximo 5 fotos do ambiente.",
          variant: "destructive"
        });
        return;
      }

      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setPhotos(prev => [
          ...prev, 
          { 
            file: file,
            preview: reader.result as string 
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      // Verificando se o bucket exists, se não, tentamos criar
      const { data: bucketExists } = await supabase.storage.getBucket('bar-media');
      if (!bucketExists) {
        await supabase.storage.createBucket('bar-media', {
          public: true
        });
        console.log("Bucket 'bar-media' criado");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('bar-media')
        .upload(filePath, file);

      if (error) throw error;

      // Obter URL pública do arquivo
      const { data: publicURL } = supabase.storage
        .from('bar-media')
        .getPublicUrl(filePath);

      return publicURL.publicUrl;
    } catch (err) {
      console.error('Erro ao fazer upload do arquivo:', err);
      throw err;
    }
  };

  const resetMedia = () => {
    setLogoFile(null);
    setLogoPreview('');
    setPhotos([]);
  };

  return {
    logoFile,
    logoPreview,
    photos,
    setLogoFile,
    setLogoPreview,
    setPhotos,
    handleLogoChange,
    handlePhotoChange,
    removePhoto,
    uploadFile,
    resetMedia
  };
};

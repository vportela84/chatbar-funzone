
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import BasicInfoForm from './BasicInfoForm';
import AddressForm from './AddressForm';
import ContactForm from './ContactForm';
import BarDetailsForm from './BarDetailsForm';
import MediaUploadForm from './MediaUploadForm';

interface PhotoFile {
  file: File;
  preview: string;
}

const BarRegistrationForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('trial');
  const [description, setDescription] = useState('');
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
        const qrCodeUrl = `https://barmatch.app/join/${data.id}`;
        
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

  const resetForm = () => {
    setName('');
    setOwnerName('');
    setDocument('');
    setAddress('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setPhone('');
    setEmail('');
    setLogin('');
    setSubscriptionPlan('trial');
    setDescription('');
    setLogoFile(null);
    setLogoPreview('');
    setPhotos([]);
  };

  return (
    <Card className="bg-bar-bg border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Cadastrar Novo Bar</CardTitle>
        <CardDescription className="text-primary/70">Preencha os dados do estabelecimento</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateBar} className="space-y-6">
          <BasicInfoForm
            name={name}
            setName={setName}
            ownerName={ownerName}
            setOwnerName={setOwnerName}
            document={document}
            setDocument={setDocument}
          />
          
          <AddressForm
            address={address}
            setAddress={setAddress}
            number={number}
            setNumber={setNumber}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
          />
          
          <ContactForm
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            login={login}
            setLogin={setLogin}
            subscriptionPlan={subscriptionPlan}
            setSubscriptionPlan={setSubscriptionPlan}
          />
          
          <BarDetailsForm
            description={description}
            setDescription={setDescription}
          />
          
          <MediaUploadForm
            logoFile={logoFile}
            logoPreview={logoPreview}
            setLogoFile={setLogoFile}
            setLogoPreview={setLogoPreview}
            photos={photos}
            setPhotos={setPhotos}
            handleLogoChange={handleLogoChange}
            handlePhotoChange={handlePhotoChange}
            removePhoto={removePhoto}
          />
          
          <Button type="submit" className="w-full mt-6">Cadastrar Bar</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BarRegistrationForm;

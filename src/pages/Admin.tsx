
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileImage, Upload, X, LogOut, BarChart2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

interface PhotoFile {
  file: File;
  preview: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

      // Verificando se o bucket exists, se não, tentamos criar
      const { data: bucketExists } = await supabase.storage.getBucket('bar-media');
      if (!bucketExists) {
        await supabase.storage.createBucket('bar-media', {
          public: true
        });
        console.log("Bucket 'bar-media' criado");
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

  const goToMonitoring = () => {
    navigate('/barmonitor');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
          <p className="text-2xl text-bar-text/80">Área Administrativa</p>
        </header>

        <div className="flex justify-between mb-4">
          <Button onClick={goToMonitoring} variant="outline" className="bg-primary/10">
            <BarChart2 className="mr-2 h-4 w-4" /> Monitorar Bares
          </Button>
          <Button onClick={handleLogout} variant="outline" className="bg-primary/10">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-bar-bg border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Cadastrar Novo Bar</CardTitle>
              <CardDescription className="text-primary/70">Preencha os dados do estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBar} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Dados Básicos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-primary">Nome do Bar *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="Nome do estabelecimento"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ownerName" className="text-primary">Nome do Responsável</Label>
                      <Input
                        id="ownerName"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="Nome completo"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document" className="text-primary">CPF/CNPJ</Label>
                    <Input
                      id="document"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="bg-black/20 border-primary/20 text-primary"
                      placeholder="CPF ou CNPJ do estabelecimento"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Endereço</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-primary">Endereço (Rua) *</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="Rua/Avenida"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="number" className="text-primary">Número</Label>
                      <Input
                        id="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="Número"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood" className="text-primary">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="Bairro"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-primary">Cidade *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="Cidade"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-primary">Estado</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="Estado"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Contato e Acesso</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-primary">Telefone/WhatsApp (Formato E.164)</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="+55XXXXXXXXXX (ex: +5511999999999)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-primary">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/20 border-primary/20 text-primary"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login" className="text-primary">Login do Bar</Label>
                    <Input
                      id="login"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      className="bg-black/20 border-primary/20 text-primary"
                      placeholder="Nome de usuário para acesso"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-primary">Assinatura do App</Label>
                    <RadioGroup 
                      value={subscriptionPlan} 
                      onValueChange={setSubscriptionPlan}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="trial" id="trial" />
                        <Label htmlFor="trial" className="cursor-pointer text-primary">Trial</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="cursor-pointer text-primary">Mensal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quarterly" id="quarterly" />
                        <Label htmlFor="quarterly" className="cursor-pointer text-primary">Trimestral</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="yearly" />
                        <Label htmlFor="yearly" className="cursor-pointer text-primary">Anual</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Detalhes do Estabelecimento</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-primary">Descrição do Bar</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-black/20 border-primary/20 text-primary min-h-[100px]"
                      placeholder="Descreva seu estabelecimento, ambiente, público-alvo, etc."
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Mídia</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-primary">Logo do Estabelecimento</Label>
                    <div className="flex flex-col space-y-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full"
                      >
                        <FileImage className="mr-2" /> Selecionar Logo
                      </Button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {logoPreview && (
                        <div className="relative w-24 h-24 overflow-hidden rounded-md">
                          <img 
                            src={logoPreview} 
                            alt="Preview do logo" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview('');
                            }}
                            className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-primary">Fotos do Ambiente (máx. 5)</Label>
                    <div className="flex flex-col space-y-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full"
                        disabled={photos.length >= 5}
                      >
                        <Upload className="mr-2" /> Adicionar Fotos ({photos.length}/5)
                      </Button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        onChange={handlePhotoChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative w-full h-24 overflow-hidden rounded-md">
                              <img 
                                src={photo.preview} 
                                alt={`Foto ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full mt-6">Cadastrar Bar</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;

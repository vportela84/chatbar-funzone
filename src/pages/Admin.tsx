
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, FileImage, Upload, Plus, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AdminDashboard from '@/components/AdminDashboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

interface Bar {
  id: string;
  name: string;
  owner_name?: string;
  document?: string;
  address: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state?: string;
  phone?: string;
  email?: string;
  login?: string;
  subscription_plan?: string;
  description?: string;
  logo_url?: string;
  qr_code?: string;
}

interface PhotoFile {
  file: File;
  preview: string;
}

const Admin = () => {
  const [bars, setBars] = useState<Bar[]>([]);
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
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>('');
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadBars = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setBars(data);
    } catch (error) {
      console.error('Erro ao carregar bares:', error);
      toast({
        title: "Erro ao carregar bares",
        description: "Não foi possível carregar a lista de bares.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadBars();
  }, []);

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
          // Implementação futura: conectar com serviço de envio de emails
        }

        await loadBars(); // Recarrega a lista de bares
        resetForm();
        
        // Mostra o QR Code automaticamente após criar o bar
        setSelectedQRCode(qrCodeUrl);
        setShowQRCode(true);

        toast({
          title: "Bar cadastrado com sucesso!",
          description: "O QR Code foi gerado automaticamente e um email será enviado ao responsável.",
        });
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

  const handleShowQRCode = (qrCode: string) => {
    setSelectedQRCode(qrCode);
    setShowQRCode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
          <p className="text-2xl text-bar-text/80">Área Administrativa</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-bar-bg border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Cadastrar Novo Bar</CardTitle>
              <CardDescription>Preencha os dados do estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBar} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Dados Básicos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Bar *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="Nome do estabelecimento"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Nome do Responsável</Label>
                      <Input
                        id="ownerName"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="Nome completo"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document">CPF/CNPJ</Label>
                    <Input
                      id="document"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="bg-black/20 border-primary/20 text-white"
                      placeholder="CPF ou CNPJ do estabelecimento"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Endereço</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Endereço (Rua) *</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="Rua/Avenida"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="Número"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="Bairro"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="Cidade"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="Estado"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Contato e Acesso</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone/WhatsApp</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="+55 (XX) XXXXX-XXXX"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/20 border-primary/20 text-white"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login">Login do Bar</Label>
                    <Input
                      id="login"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      className="bg-black/20 border-primary/20 text-white"
                      placeholder="Nome de usuário para acesso"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Assinatura do App</Label>
                    <RadioGroup 
                      value={subscriptionPlan} 
                      onValueChange={setSubscriptionPlan}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="trial" id="trial" />
                        <Label htmlFor="trial" className="cursor-pointer">Trial</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="cursor-pointer">Mensal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quarterly" id="quarterly" />
                        <Label htmlFor="quarterly" className="cursor-pointer">Trimestral</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="yearly" />
                        <Label htmlFor="yearly" className="cursor-pointer">Anual</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Detalhes do Estabelecimento</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição do Bar</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-black/20 border-primary/20 text-white min-h-[100px]"
                      placeholder="Descreva seu estabelecimento, ambiente, público-alvo, etc."
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary">Mídia</h3>
                  
                  <div className="space-y-2">
                    <Label>Logo do Estabelecimento</Label>
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
                    <Label>Fotos do Ambiente (máx. 5)</Label>
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

          {/* Lista de Bares Cadastrados */}
          <Card className="bg-bar-bg border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Bares Cadastrados</CardTitle>
              <CardDescription>Lista de todos os bares cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bars.map((bar) => (
                  <Card key={bar.id} className="bg-black/20 border-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                          {bar.logo_url && (
                            <div className="w-12 h-12 overflow-hidden rounded-md">
                              <img 
                                src={bar.logo_url} 
                                alt={`Logo ${bar.name}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-primary">{bar.name}</h3>
                            <p className="text-sm text-primary/70">
                              {bar.address}
                              {bar.number && `, ${bar.number}`}
                              {bar.city && `, ${bar.city}`}
                              {bar.state && `/${bar.state}`}
                            </p>
                            {bar.phone && <p className="text-xs text-primary/60">{bar.phone}</p>}
                          </div>
                        </div>
                        {bar.qr_code && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowQRCode(bar.qr_code!)}
                            className="flex items-center gap-2"
                          >
                            <QrCode className="w-4 h-4" />
                            Ver QR Code
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <AdminDashboard />
        </div>

        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="bg-bar-bg border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-primary">QR Code do Bar</DialogTitle>
              <DialogDescription>
                Compartilhe este QR Code com seus clientes
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 bg-white rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQRCode)}`}
                alt="QR Code"
                className="mx-auto"
              />
            </div>
            <p className="text-center text-sm text-bar-text/60 mt-2">
              {selectedQRCode}
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;

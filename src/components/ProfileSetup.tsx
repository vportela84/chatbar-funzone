
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, UserRound } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSetupProps {
  onComplete: (profile: { name: string; phone: string; photo?: string; interest: string }) => void;
  barInfo: { barId: string; barName: string; tableNumber: string };
}

const ProfileSetup = ({ onComplete, barInfo }: ProfileSetupProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [interest, setInterest] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!name.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, digite seu nome ou apelido",
          variant: "destructive",
        });
        return;
      }
      
      // Prevenir múltiplos envios
      if (isSubmitting) {
        return;
      }
      
      setIsSubmitting(true);
      console.log("ProfileSetup: Enviando dados do perfil", { name, phone, interest });
      
      // Verificar conexão com Supabase (apenas para diagnóstico)
      try {
        const { data, error } = await supabase.from('bars').select('count').limit(1);
        if (error) {
          console.warn('Possível problema de conectividade com Supabase:', error);
        } else {
          console.log('Conexão com Supabase OK');
        }
      } catch (connError) {
        console.error('Erro ao verificar conexão com Supabase:', connError);
      }
      
      // Normalizar o número de telefone (remover caracteres não numéricos)
      const normalizedPhone = phone.trim().replace(/\D/g, '');
      
      // Aqui estamos chamando onComplete
      await onComplete({ 
        name: name.trim(), 
        phone: normalizedPhone,
        photo: photo || undefined, 
        interest 
      });
      
    } catch (error) {
      console.error("Erro ao enviar perfil:", error);
      toast({
        title: "Erro",
        description: "Houve um erro ao enviar seu perfil. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limitar o tamanho máximo do telefone
    const value = e.target.value;
    if (value.length <= 15) {
      setPhone(value);
    }
  };

  return (
    <form onSubmit={handleProfileSubmit} className="space-y-6 p-6 bg-bar-bg rounded-lg max-w-md w-full mx-auto animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-primary">{barInfo.barName}</h2>
        <p className="text-primary/80">Mesa {barInfo.tableNumber}</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={photo || undefined} />
          <AvatarFallback>
            <UserRound className="w-12 h-12 text-primary/50" />
          </AvatarFallback>
        </Avatar>
        
        <div className="w-full">
          <Label 
            htmlFor="photo" 
            className="flex items-center justify-center space-x-2 cursor-pointer p-2 border border-dashed border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <ImagePlus className="w-5 h-5 text-primary" />
            <span className="text-primary">Adicionar Foto</span>
          </Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Verificar tamanho do arquivo (limite de 5MB)
                if (file.size > 5 * 1024 * 1024) {
                  toast({
                    title: "Arquivo muito grande",
                    description: "Por favor, escolha uma imagem com menos de 5MB",
                    variant: "destructive"
                  });
                  return;
                }
                
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPhoto(reader.result as string);
                };
                reader.onerror = () => {
                  toast({
                    title: "Erro",
                    description: "Não foi possível carregar a imagem",
                    variant: "destructive"
                  });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-primary">Nome ou Apelido</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/20 border-primary/20 text-white"
            placeholder="Digite seu nome"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-primary">Telefone (Opcional)</Label>
          <Input
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            className="bg-black/20 border-primary/20 text-white"
            placeholder="Digite seu número de telefone"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-primary">Tenho interesse em conhecer</Label>
          <RadioGroup 
            value={interest} 
            onValueChange={setInterest}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" className="text-primary" />
              <Label htmlFor="all" className="text-primary">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="men" id="men" className="text-primary" />
              <Label htmlFor="men" className="text-primary">Homens</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="women" id="women" className="text-primary" />
              <Label htmlFor="women" className="text-primary">Mulheres</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button 
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processando..." : "Começar a Conversar"}
      </Button>
    </form>
  );
};

export default ProfileSetup;

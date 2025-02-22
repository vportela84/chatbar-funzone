
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, UserRound } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from '@/integrations/supabase/client';

interface ProfileSetupProps {
  onComplete: (profile: { name: string; phone: string; photo?: string; interest: string }) => void;
  tableId: string;
  onTableIdChange: (tableId: string) => void;
  barId: string | null;
}

const ProfileSetup = ({ onComplete, tableId, onTableIdChange, barId }: ProfileSetupProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [interest, setInterest] = useState("all");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [tempTableId, setTempTableId] = useState(tableId);
  const { toast } = useToast();

  const handleQRCodeScan = (qrData: string) => {
    try {
      // Exemplo de URL esperada: https://barmatch.app/join/BAR_ID/TABLE_ID
      const url = new URL(qrData);
      const segments = url.pathname.split('/');
      const barIdFromQR = segments[2];
      const tableIdFromQR = segments[3];

      if (barIdFromQR && tableIdFromQR) {
        onTableIdChange(tableIdFromQR);
        setShowProfileForm(true);
      } else {
        toast({
          title: "QR Code inválido",
          description: "O QR Code não contém as informações necessárias",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "QR Code inválido",
        description: "Não foi possível ler as informações do QR Code",
        variant: "destructive",
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTableIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempTableId.trim()) {
      toast({
        title: "Número da mesa obrigatório",
        description: "Por favor, digite o número da sua mesa",
        variant: "destructive",
      });
      return;
    }
    onTableIdChange(tempTableId);
    setShowProfileForm(true);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu nome ou apelido",
        variant: "destructive",
      });
      return;
    }
    onComplete({ name, phone, photo: photo || undefined, interest });
  };

  if (!showProfileForm) {
    return (
      <form onSubmit={handleTableIdSubmit} className="space-y-6 p-6 bg-bar-bg rounded-lg max-w-md w-full mx-auto animate-fadeIn">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-bar-text">Bem-vindo ao Bar Match</h2>
          <p className="text-bar-text/80">Digite o número da sua mesa para começar</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tableId" className="text-bar-text">Número da Mesa</Label>
          <Input
            id="tableId"
            value={tempTableId}
            onChange={(e) => setTempTableId(e.target.value)}
            className="bg-black/20 border-primary/20 text-white"
            placeholder="Ex: 123"
          />
        </div>

        <Button 
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Continuar
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleProfileSubmit} className="space-y-6 p-6 bg-bar-bg rounded-lg max-w-md w-full mx-auto animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-bar-text">Mesa {tableId}</h2>
        <p className="text-bar-text/80">Crie seu perfil para começar a conversar</p>
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
            <span className="text-bar-text">Adicionar Foto</span>
          </Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-bar-text">Nome ou Apelido</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/20 border-primary/20 text-white"
            placeholder="Digite seu nome"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-bar-text">Telefone (Opcional)</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-black/20 border-primary/20 text-white"
            placeholder="Digite seu número de telefone"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-bar-text">Tenho interesse em conhecer</Label>
          <RadioGroup 
            value={interest} 
            onValueChange={setInterest}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" className="text-primary" />
              <Label htmlFor="all" className="text-white">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="men" id="men" className="text-primary" />
              <Label htmlFor="men" className="text-white">Homens</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="women" id="women" className="text-primary" />
              <Label htmlFor="women" className="text-white">Mulheres</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button 
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Começar a Conversar
      </Button>
    </form>
  );
};

export default ProfileSetup;

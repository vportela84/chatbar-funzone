
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MenuView from '@/components/MenuView';

interface ProfileSetupProps {
  tableId: string;
  barId: string;
  onProfileCreated: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ tableId, barId, onProfileCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu nome.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('bar_profiles')
        .insert([
          {
            name,
            phone,
            table_id: tableId,
            bar_id: barId,
            interest: 'all' // valor padrão
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil criado com sucesso!",
      });
      
      onProfileCreated();
    } catch (error: any) {
      console.error('Erro ao criar perfil:', error);
      toast({
        title: "Erro ao criar perfil",
        description: error.message || "Houve um erro ao criar seu perfil.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showMenu) {
    return <MenuView barId={barId} onBack={() => setShowMenu(false)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-lg rounded-xl shadow-xl p-8 space-y-6 border border-primary/20">
        <h2 className="text-center text-2xl font-bold text-primary">
          Complete seu Perfil
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-bar-text text-sm">
              Nome
            </Label>
            <Input
              type="text"
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 bg-black/50 border-primary/20 text-bar-text placeholder:text-gray-500"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-bar-text text-sm">
              Telefone
            </Label>
            <Input
              type="tel"
              id="phone"
              placeholder="Seu telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 bg-black/50 border-primary/20 text-bar-text placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMenu(true)}
              className="w-full border-primary/20 text-primary hover:bg-primary/10"
            >
              Ver Cardápio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

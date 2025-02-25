
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRScanner from '@/components/QRScanner';
import MenuView from '@/components/MenuView';

interface ProfileSetupProps {
  tableId: string;
  barId: string;
  onProfileCreated: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ tableId, barId, onProfileCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!name) {
      setError('Por favor, insira seu nome.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('tableId', tableId);
      formData.append('barId', barId);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/create-profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Profile created successfully:', data);
        onProfileCreated();
      } else {
        setError(data.message || 'Failed to create profile.');
      }
    } catch (e: any) {
      console.error('There was an error creating the profile:', e);
      setError(e.message || 'There was an error creating the profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhoto(e.target.files[0]);
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
          <div>
            <Label htmlFor="photo" className="text-bar-text text-sm">
              Foto
            </Label>
            <Input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1 bg-black/50 border-primary/20 text-bar-text file:bg-primary file:text-primary-foreground file:border-0 file:rounded-lg file:px-4 file:py-2 hover:file:bg-primary/90"
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
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

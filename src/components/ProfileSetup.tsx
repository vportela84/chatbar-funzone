
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-700">
          Complete seu Cadastro
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nome:
            </Label>
            <Input
              type="text"
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Telefone:
            </Label>
            <Input
              type="tel"
              id="phone"
              placeholder="Seu telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">
              Foto:
            </Label>
            <Input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMenu(true)}
              className="w-full"
            >
              Ver Cardápio
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

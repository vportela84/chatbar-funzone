
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, UserRound } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: { name: string; phone: string; photo?: string }) => void;
  tableId: string;
}

const ProfileSetup = ({ onComplete, tableId }: ProfileSetupProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name or nickname",
        variant: "destructive",
      });
      return;
    }
    onComplete({ name, phone, photo: photo || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-bar-bg rounded-lg max-w-md w-full mx-auto animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-bar-text">Welcome to Table {tableId}</h2>
        <p className="text-bar-text/80">Create your profile to start chatting</p>
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
            <span className="text-bar-text">Add Photo</span>
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
          <Label htmlFor="name" className="text-bar-text">Name or Nickname</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/20 border-primary/20 text-bar-text"
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-bar-text">Phone (Optional)</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-black/20 border-primary/20 text-bar-text"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <Button 
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Start Chatting
      </Button>
    </form>
  );
};

export default ProfileSetup;

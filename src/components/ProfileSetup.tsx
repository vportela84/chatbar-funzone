
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  onComplete: (profile: { name: string; phone: string }) => void;
  tableId: string;
}

const ProfileSetup = ({ onComplete, tableId }: ProfileSetupProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

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
    onComplete({ name, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-bar-bg rounded-lg max-w-md w-full mx-auto animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-bar-text">Welcome to Table {tableId}</h2>
        <p className="text-bar-text/80">Create your profile to start chatting</p>
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

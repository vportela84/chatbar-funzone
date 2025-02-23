
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AdminDashboard from '@/components/AdminDashboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Bar {
  id: string;
  name: string;
  address: string;
  city: string;
  qrCode: string;
}

const Admin = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>('');
  const { toast } = useToast();

  const handleCreateBar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('bars')
        .insert([
          {
            name,
            address,
            city,
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

        const newBar: Bar = {
          id: data.id,
          name: data.name,
          address: data.address,
          city: data.city,
          qrCode: qrCodeUrl,
        };

        setBars(prevBars => [newBar, ...prevBars]);
        setName('');
        setAddress('');
        setCity('');
        
        // Mostra o QR Code automaticamente após criar o bar
        setSelectedQRCode(qrCodeUrl);
        setShowQRCode(true);

        toast({
          title: "Bar cadastrado com sucesso!",
          description: "O QR Code foi gerado automaticamente.",
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

  const handleShowQRCode = (qrCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
              <form onSubmit={handleCreateBar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Bar</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/20 border-primary/20 text-white"
                    placeholder="Digite o nome do bar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-black/20 border-primary/20 text-white"
                    placeholder="Digite o endereço completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-black/20 border-primary/20 text-white"
                    placeholder="Digite a cidade"
                  />
                </div>
                <Button type="submit" className="w-full">Cadastrar Bar</Button>
              </form>
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
